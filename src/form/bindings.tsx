// Bindings between @sustenaut/ui's form components and react-hook-form. The page owns the form
// (useForm, default values and the validation rules, which are business rules); these only connect
// fields to it and show its errors. Process rules (who may do what, and when) stay in the page's
// state machine: a valid submit becomes one event sent to it.
import type { ReactNode } from "react";
import {
  Controller, FormProvider, get, useFormContext, type FieldValues, type RegisterOptions, type SubmitHandler,
  type UseFormReturn,
} from "react-hook-form";
import { ChoiceGroup, Field, type Choice } from "../components/Form";

/** A form wired to react-hook-form: children use the fields below; `onValid` gets the values
 *  only when every rule passes. */
export function Form<T extends FieldValues>({ form, onValid, children, label }: {
  form: UseFormReturn<T>; onValid: SubmitHandler<T>; children: ReactNode; label?: string;
}) {
  return (
    <FormProvider {...form}>
      <form noValidate aria-label={label} onSubmit={form.handleSubmit(onValid)} className="su-stack">
        {children}
      </form>
    </FormProvider>
  );
}

function useError(name: string): string | undefined {
  const { formState: { errors } } = useFormContext();
  return get(errors, name)?.message as string | undefined;
}

/** A text input or text area bound to a form field. */
export function TextField({ name, label, hint, rules, multiline, rows = 3, placeholder }: {
  name: string; label: ReactNode; hint?: ReactNode; rules?: RegisterOptions; multiline?: boolean; rows?: number;
  placeholder?: string;
}) {
  const { register } = useFormContext();
  const error = useError(name);
  return (
    <Field label={label} hint={hint} error={error}>
      {multiline
        ? <textarea rows={rows} placeholder={placeholder} {...register(name, rules)} />
        : <input placeholder={placeholder} spellCheck={false} {...register(name, rules)} />}
    </Field>
  );
}

/** A ChoiceGroup bound to a form field, with the field's error below it. */
export function ChoiceField<V extends string>({ name, label, choices, rules, size }: {
  name: string; label: string; choices: Choice<V>[]; rules?: RegisterOptions; size?: "normal" | "large";
}) {
  const { control } = useFormContext();
  const error = useError(name);
  return (
    <div className="su-field">
      <Controller name={name} control={control} rules={rules} render={({ field }) => (
        <ChoiceGroup label={label} choices={choices} size={size} value={(field.value as V) ?? null}
                     onChange={(v) => field.onChange(v)} />
      )} />
      {error && <span className="su-field__error" role="alert">{error}</span>}
    </div>
  );
}
