import { Check as CheckIcon } from '@tamagui/lucide-icons'
import type { CheckboxProps } from 'tamagui'
import { Checkbox as InternalCheckbox, Label, XStack, YStack } from 'tamagui'


export function Checkbox({
  size,
  label = 'Accept terms and conditions',
  ...checkboxProps
}: CheckboxProps & { label?: string }) {
  const id = `checkbox-${(size || '').toString().slice(1)}`
  return (
    <XStack width={300} alignItems="center" gap="$4">
      <InternalCheckbox id={id} size={size} {...checkboxProps}>
        <InternalCheckbox.Indicator>
          <CheckIcon />
        </InternalCheckbox.Indicator>
      </InternalCheckbox>

      <Label size={size} htmlFor={id}>
        {label}
      </Label>
    </XStack>
  )
}