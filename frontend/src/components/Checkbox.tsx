import { Check as CheckIcon } from '@tamagui/lucide-icons'
import type { CheckboxProps } from 'tamagui'
import { Checkbox as InternalCheckbox, Label, XStack} from 'tamagui'
import { useThemeName } from 'tamagui';
import { lightTheme, darkTheme } from '../themes';

export function Checkbox({
  size,
  label = '',
  ...checkboxProps
}: CheckboxProps & { label?: string }) {
  const theme  = useThemeName();
  const id = `checkbox-${(size || '').toString().slice(1)}`
  return (
    <XStack width={50} alignItems="center" gap="$4">
      <InternalCheckbox id={id} size={size} {...checkboxProps}>
        <InternalCheckbox.Indicator>
          <CheckIcon />
        </InternalCheckbox.Indicator>
      </InternalCheckbox>

      <Label color={theme=== 'dark' ? darkTheme.color : lightTheme.color} size={size} htmlFor={id}>
        {label}
      </Label>
    </XStack>
  )
}