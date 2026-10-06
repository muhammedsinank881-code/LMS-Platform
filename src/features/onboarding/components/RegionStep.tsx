import { Controller, useFormContext } from 'react-hook-form'
import { FormField } from '@/components/common/FormField'
import { Select } from '@/components/ui'
import { CURRENCY_OPTIONS, TIMEZONE_OPTIONS } from '@/lib/locale-options'
import type { OnboardingValues } from '../schemas'

export function RegionStep() {
  const {
    control,
    formState: { errors },
  } = useFormContext<OnboardingValues>()

  return (
    <div className="space-y-4">
      <FormField
        id="onboarding-currency"
        label="Currency"
        required
        error={errors.currency?.message}
      >
        {({ id, invalid }) => (
          <Controller
            control={control}
            name="currency"
            render={({ field }) => (
              <Select
                id={id}
                invalid={invalid}
                options={CURRENCY_OPTIONS}
                value={field.value}
                onValueChange={field.onChange}
                placeholder="Choose a currency"
              />
            )}
          />
        )}
      </FormField>

      <FormField
        id="onboarding-timezone"
        label="Timezone"
        required
        error={errors.timezone?.message}
      >
        {({ id, invalid }) => (
          <Controller
            control={control}
            name="timezone"
            render={({ field }) => (
              <Select
                id={id}
                invalid={invalid}
                options={TIMEZONE_OPTIONS}
                value={field.value}
                onValueChange={field.onChange}
                placeholder="Choose a timezone"
              />
            )}
          />
        )}
      </FormField>
    </div>
  )
}
