import React from 'react';
import { Adapt, Select as InternalSelect, Sheet, XStack, YStack, getFontSize } from 'tamagui'
import type { FontSizeTokens, SelectProps } from 'tamagui'
import { Check, ChevronDown, ChevronUp } from '@tamagui/lucide-icons'
import { LinearGradient } from 'tamagui/linear-gradient'
import { Dimensions } from 'react-native';

type CustomSelectProps = SelectProps & {
  items: any[];
};

export const Select = (props: CustomSelectProps) => {
  const [val, setVal] = React.useState(String(props.defaultValue))
  const isEmpty = !props.items || props.items.length === 0;

  const { width: screenWidth } = Dimensions.get('window');
  const isMobile = screenWidth < 480;

  return (
    <XStack ai="center" gap="$4">
      <InternalSelect value={val} onValueChange={setVal} disablePreventBodyScroll {...props}>
        <InternalSelect.Trigger
          width={isMobile ? 300 : 260}
          height={isMobile ? 50 : 40}
          iconAfter={ChevronDown}
          disabled={isEmpty}
          opacity={isEmpty ? 0.5 : 1}
        >          <InternalSelect.Value
            placeholder={isEmpty ? "No items available" : "Select an option"}
          />      </InternalSelect.Trigger>


        <InternalSelect.Content zIndex={200000}>
          <InternalSelect.ScrollUpButton
            alignItems="center"
            justifyContent="center"
            position="relative"
            width="100%"
            height="$3"
          >f
            <YStack zIndex={10}>
              <ChevronUp size={20} />
            </YStack>
            <LinearGradient
              start={[0, 0]}
              end={[0, 1]}
              fullscreen
              colors={['$background', 'transparent']}
              borderRadius="$4"
            />
          </InternalSelect.ScrollUpButton>

          <InternalSelect.Viewport
            minWidth={isMobile ? 320 : 260}
          >
            <InternalSelect.Group>
              {/* for longer lists memoizing these is useful */}
              {React.useMemo(
                () =>
                  props.items.map((item, i) => {
                    return (
                      <InternalSelect.Item
                        index={i}
                        key={String(item.value)}
                        value={String(item.value)}
                      >
                        <InternalSelect.ItemText>{item.label}</InternalSelect.ItemText>
                        <InternalSelect.ItemIndicator marginLeft="auto">
                          <Check size={16} />
                        </InternalSelect.ItemIndicator>
                      </InternalSelect.Item>
                    )
                  }),
                [props.items]
              )}
            </InternalSelect.Group>
            {/* Native gets an extra icon */}
            {props.native && (
              <YStack
                position="absolute"
                right={0}
                top={0}
                bottom={0}
                alignItems="center"
                justifyContent="center"
                width={'$4'}
                pointerEvents="none"
              >
                <ChevronDown
                  size={getFontSize((props.size as FontSizeTokens) ?? '$true')}
                />
              </YStack>
            )}
          </InternalSelect.Viewport>

          <InternalSelect.ScrollDownButton
            alignItems="center"
            justifyContent="center"
            position="relative"
            width="100%"
            height="$3"
          >
            <YStack zIndex={10}>
              <ChevronDown size={20} />
            </YStack>
            <LinearGradient
              start={[0, 0]}
              end={[0, 1]}
              fullscreen
              colors={['transparent', '$background']}
              borderRadius="$4"
            />
          </InternalSelect.ScrollDownButton>
        </InternalSelect.Content>
      </InternalSelect>
    </XStack>

  )
}
