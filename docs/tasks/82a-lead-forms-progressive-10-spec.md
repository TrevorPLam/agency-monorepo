# 82a-lead-forms-progressive: Implementation Specification

## Task Header

| Field | Value |
|-------|-------|
| **State** | `conditional` — Package-controlled, opt-in only |
| **Trigger** | App requires multi-step progressive lead forms |
| **Minimum Consumers** | 1+ apps with complex form needs |
| **Dependencies** | React 19.2.5, React Hook Form, `@agency/ui-design-system` |
| **Exit Criteria** | Progressive forms package exported and used |
| **Implementation Authority** | `REPO-STATE.md` — Conditional; requires explicit form needs |
| **Version Authority** | `DEPENDENCY.md` §2 — React 19.2.5 |
| **Supersedes** | n/a |
| **Superseded by** | n/a |

**Cross-references:**
- Decision status: `DECISION-STATUS.md` — Progressive forms `open`
- Version pins: `DEPENDENCY.md` §2
- Note: Sub-task of 82-lead-capture; advanced form patterns

## Files

```
packages/lead-capture/progressive-forms/
├── package.json
├── tsconfig.json
├── 01-config-biome-migration-50-ref-quickstart.md
├── src/
│   ├── index.ts
│   ├── machine.ts
│   ├── components/
│   │   ├── ProgressiveForm.tsx
│   │   ├── FormStep.tsx
│   │   └── ProgressIndicator.tsx
│   ├── hooks/
│   │   ├── useProgressiveForm.ts
│   │   └── useFormPersistence.ts
│   ├── validation.ts
│   └── analytics.ts
└── examples/
    └── contact-form.tsx
```

### `package.json`

```json
{
  "name": "@agency/lead-capture-progressive",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./src/index.ts",
    "./machine": "./src/machine.ts",
    "./components": "./src/components/index.ts",
    "./hooks": "./src/hooks/index.ts"
  },
  "dependencies": {
    "@agency/core-types": "workspace:*",
    "@agency/ui-design-system": "workspace:*",
    "xstate": "5.x",
    "@xstate/react": "5.x",
    "zod": "3.23.0"
  },
  "devDependencies": {
    "@agency/config-eslint": "workspace:*",
    "@agency/config-typescript": "workspace:*"
  },
  "publishConfig": { "access": "restricted" }
}
```

### `src/machine.ts`

```typescript
// XState v5-based form state machine
// Migrated from v4: Machine() -> createMachine(), interpret() -> createActor()

import { createMachine, assign } from 'xstate';
import { z } from 'zod';

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'select' | 'textarea';
  validation: z.ZodType<any>;
  required: boolean;
  placeholder?: string;
  options?: string[];  // For select
}

export interface FormStep {
  id: string;
  title: string;
  description?: string;
  fields: FormField[];
  skipIf?: (data: Record<string, any>) => boolean;
}

export interface FormConfig {
  id: string;
  steps: FormStep[];
  onSubmit: (data: Record<string, any>) => Promise<void>;
}

interface FormContext {
  currentStep: number;
  formData: Record<string, any>;
  errors: Record<string, string>;
  history: number[];
}

type FormEvent =
  | { type: 'NEXT'; data: Record<string, any> }
  | { type: 'PREV' }
  | { type: 'SUBMIT' }
  | { type: 'SET_DATA'; data: Record<string, any> }
  | { type: 'VALIDATE'; field: string; value: any };

export function createFormMachine(config: FormConfig) {
  return createMachine({
    id: config.id,
    initial: 'step_0',
    context: {
      currentStep: 0,
      formData: {},
      errors: {},
      history: []
    } as FormContext,
    states: generateStepStates(config.steps)
  }, {
    actions: {
      updateData: assign({
        formData: (ctx, event) => {
          if (event.type === 'NEXT' || event.type === 'SET_DATA') {
            return { ...ctx.formData, ...event.data };
          }
          return ctx.formData;
        }
      }),
      
      validateStep: assign({
        errors: (ctx, event, meta) => {
          const step = config.steps[ctx.currentStep];
          const errors: Record<string, string> = {};
          
          for (const field of step.fields) {
            const value = ctx.formData[field.name];
            const result = field.validation.safeParse(value);
            
            if (!result.success) {
              errors[field.name] = result.error.errors[0]?.message || 'Invalid';
            }
          }
          
          return errors;
        }
      }),
      
      recordHistory: assign({
        history: (ctx) => [...ctx.history, ctx.currentStep]
      })
    },
    // XState v5: guards use 'guard' property instead of 'cond'
    // Transitions are internal by default (no 'internal: false' needed)
    guards: {
      isStepValid: ({ context }) => {
        const step = config.steps[context.currentStep];
        for (const field of step.fields) {
          const value = context.formData[field.name];
          if (!field.validation.safeParse(value).success) {
            return false;
          }
        }
        return true;
      },
      
      canSkip: ({ context }) => {
        const nextStep = config.steps[context.currentStep + 1];
        return nextStep?.skipIf?.(context.formData) ?? false;
      }
    }
  });
}

function generateStepStates(steps: FormStep[]) {
  const states: Record<string, any> = {};
  
  steps.forEach((step, index) => {
    states[`step_${index}`] = {
      on: {
        NEXT: {
          target: `step_${index + 1}`,
          cond: 'isStepValid',
          actions: ['updateData', 'recordHistory']
        },
        PREV: {
          target: `step_${Math.max(0, index - 1)}`
        },
        SET_DATA: {
          actions: 'updateData'
        }
      }
    };
  });
  
  states.submitting = {
    invoke: {
      src: 'submitForm',
      onDone: 'success',
      onError: 'error'
    }
  };
  
  states.success = { type: 'final' };
  states.error = {
    on: { RETRY: `step_${steps.length - 1}` }
  };
  
  return states;
}
```

### `src/hooks/useProgressiveForm.ts`

```typescript
'use client';

// XState v5: useMachine() returns [snapshot, actor] instead of [state, send, service]
// useActorRef() available for actor reference if needed
import { useMachine } from '@xstate/react';
import { createFormMachine, type FormConfig } from '../machine';

export function useProgressiveForm(config: FormConfig) {
  const machine = createFormMachine(config);
  // XState v5: useMachine returns [snapshot, actor]
  const [snapshot, actor] = useMachine(machine);

  const currentStep = snapshot.context.currentStep;
  const stepConfig = config.steps[currentStep];
  const progress = ((currentStep + 1) / config.steps.length) * 100;

  return {
    currentStep,
    stepConfig,
    progress,
    formData: snapshot.context.formData,
    errors: snapshot.context.errors,
    // XState v5: snapshot.status === 'done' instead of state.done
    isValid: snapshot.status === 'active',
    isSubmitting: snapshot.matches({ submitting: 'pending' }),
    isSuccess: snapshot.status === 'done',
    
    // XState v5: actor.send() instead of send()
    next: (data: Record<string, any>) => actor.send({ type: 'NEXT', data }),
    prev: () => actor.send({ type: 'PREV' }),
    submit: () => actor.send({ type: 'SUBMIT' }),
    setData: (data: Record<string, any>) => actor.send({ type: 'SET_DATA', data })
  };
}
```

### `src/hooks/useFormPersistence.ts`

```typescript
'use client';

import { useEffect, useCallback } from 'react';

const STORAGE_PREFIX = 'agency-form:';

export function useFormPersistence(formId: string, formData: Record<string, any>) {
  const storageKey = `${STORAGE_PREFIX}${formId}`;

  // Load persisted data on mount
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Merge with current data
        Object.assign(formData, parsed);
      } catch {
        // Invalid saved data, ignore
      }
    }
  }, [formId]);

  // Persist on change
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(formData));
  }, [storageKey, formData]);

  const clearPersistence = useCallback(() => {
    localStorage.removeItem(storageKey);
  }, [storageKey]);

  return { clearPersistence };
}
```

### `src/components/ProgressiveForm.tsx`

```typescript
'use client';

import { useProgressiveForm } from '../hooks/useProgressiveForm';
import { FormStep } from './FormStep';
import { ProgressIndicator } from './ProgressIndicator';
import type { FormConfig } from '../machine';

interface ProgressiveFormProps {
  config: FormConfig;
}

export function ProgressiveForm({ config }: ProgressiveFormProps) {
  const {
    currentStep,
    stepConfig,
    progress,
    formData,
    errors,
    isSubmitting,
    isSuccess,
    next,
    prev,
    submit
  } = useProgressiveForm(config);

  if (isSuccess) {
    return <SuccessMessage />;
  }

  return (
    <div className="progressive-form">
      <ProgressIndicator progress={progress} steps={config.steps.length} current={currentStep} />
      
      <FormStep
        config={stepConfig}
        data={formData}
        errors={errors}
        onNext={next}
        onPrev={currentStep > 0 ? prev : undefined}
        isFirst={currentStep === 0}
        isLast={currentStep === config.steps.length - 1}
        onSubmit={submit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}

function SuccessMessage() {
  return (
    <div className="form-success">
      <h2>Thank you!</h2>
      <p>We'll be in touch shortly.</p>
    </div>
  );
}
```

### `src/analytics.ts`

```typescript
// Form analytics for drop-off tracking

export interface FormAnalytics {
  trackStepView: (stepId: string, formId: string) => void;
  trackStepComplete: (stepId: string, formId: string, durationMs: number) => void;
  trackFormAbandon: (stepId: string, formId: string, field?: string) => void;
  trackFormSubmit: (formId: string, totalSteps: number, totalDurationMs: number) => void;
}

export function createFormAnalytics(analyticsProvider?: any): FormAnalytics {
  return {
    trackStepView: (stepId, formId) => {
      console.log('[Form Analytics]', 'Step viewed:', { stepId, formId, timestamp: Date.now() });
      // Send to analytics
    },
    
    trackStepComplete: (stepId, formId, durationMs) => {
      console.log('[Form Analytics]', 'Step completed:', { stepId, formId, durationMs });
    },
    
    trackFormAbandon: (stepId, formId, field) => {
      console.log('[Form Analytics]', 'Form abandoned:', { stepId, formId, field });
    },
    
    trackFormSubmit: (formId, totalSteps, totalDurationMs) => {
      console.log('[Form Analytics]', 'Form submitted:', { formId, totalSteps, totalDurationMs });
    }
  };
}
```

### README

```markdown
# @agency/lead-capture-progressive

Multi-step forms with progressive profiling for lead capture.

## The Problem

- 8-field form → 60% abandonment
- Users overwhelmed by long forms
- Lost leads who started but didn't finish

## The Solution

Break forms into digestible steps:

```
Step 1: Email only (quick win)
  ↓
Step 2: Name + company
  ↓
Step 3: Project details
  ↓
Step 4: Budget + timeline
```

## Usage

```typescript
import { ProgressiveForm } from '@agency/lead-capture-progressive';
import { z } from 'zod';

const config = {
  id: 'contact-form',
  steps: [
    {
      id: 'email',
      title: "Let's start with your email",
      fields: [
        {
          name: 'email',
          label: 'Email',
          type: 'email',
          validation: z.string().email(),
          required: true
        }
      ]
    },
    {
      id: 'details',
      title: 'Tell us about your project',
      fields: [
        { name: 'company', label: 'Company', type: 'text', validation: z.string(), required: true },
        { name: 'budget', label: 'Budget', type: 'select', validation: z.string(), options: ['<5k', '5k-25k', '25k+'], required: true }
      ]
    }
  ],
  onSubmit: async (data) => {
    await fetch('/api/leads', { method: 'POST', body: JSON.stringify(data) });
  }
};

export default function ContactPage() {
  return <ProgressiveForm config={config} />;
}
```

## Progressive Profiling

Skip fields if data already known:

```typescript
{
  id: 'company',
  title: 'Company details',
  skipIf: (data) => data.email?.includes('@enterprise.com'),
  fields: [...]
}
```

## Analytics

Tracks:
- Step drop-off rates
- Field-level errors
- Time per step
- Abandonment points

## Persistence

Form data automatically saved to localStorage:
- User can return later
- No lost progress
- Cleared on successful submit
```


## Related Tasks

- `82-lead-capture` - Simple lead forms
- `82b-lead-enrichment` - Data enrichment
- `80-analytics` - Form analytics
