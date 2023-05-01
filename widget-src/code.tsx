const { widget, ui, showUI } = figma
const { useEffect, useSyncedState, Text, Input, AutoLayout, usePropertyMenu } = widget

type ColorContrastRatioCalculatorInput = string | Array<number>;

const ModeIcon = `<svg fill="none" height="20" viewBox="0 0 40 40" width="20" xmlns="http://www.w3.org/2000/svg"><path clip-rule="evenodd" d="m20 38c-9.9411 0-18-8.0589-18-18s8.0589-18 18-18 18 8.0589 18 18-8.0589 18-18 18zm0-35v34c9.3888 0 17-7.6112 17-17s-7.6112-17-17-17zm.0002 9.8001c3.9764 0 7.2 3.2235 7.2 7.2 0 3.9764-3.2236 7.2-7.2 7.2zm-.0004 14.3998c-3.9764 0-7.2-3.2235-7.2-7.2 0-3.9764 3.2236-7.2 7.2-7.2z" fill="#fff" fill-rule="evenodd"/></svg>`

function Widget() {
  const [darkMode, setDarkMode] = useSyncedState<boolean>('darkMode', false);
  const [showLabels, setShowLabels] = useSyncedState<boolean>('showLabels', false);
  const [horizontalLayout, setHorizontalLayout] = useSyncedState<boolean>('horizontalLayout', false);
  const [foreground, setForeground] = useSyncedState<string>("foreground", "#898989");
  const [background, setBackground] = useSyncedState<string>("background", "#454545");
  const [foregroundLabel, setForegroundLabel] = useSyncedState<string | null>("foregroundLabel", null);
  const [backgroundLabel, setBackgroundLabel] = useSyncedState<string | null>("backgroundLabel", null);
  const [ratio, setRatio] = useSyncedState<number>("ratio", 0);

  const validateForegroundInput = (input: string) => {
    const sanitisedHex = input.replace("#", "").toLowerCase();

    if (validateHexString(sanitisedHex)) {
      return setForeground(input)
    } else {
      figma.notify("Please enter a valid HEX value", { error: true })
    }
  }

  const validateBackgroundInput = (input: string) => {
    const sanitisedHex = input.replace("#", "").toLowerCase();

    if (validateHexString(sanitisedHex)) {
      return setBackground(input)
    } else {
      figma.notify("Please enter a valid HEX value", { error: true })
    }
  }

  // Validate HEX input
  const validateHexString = (input: string) => {
    const regex = new RegExp(/[0-9a-f]{6}/);
    if (input.length === 6 || regex.test(input)) {
      return true;
    }
    return false;
  };

  // Convert hex:string to RGB:array
  const convertHexToRgb = (input: string) => {
    const sanitisedHex = input.replace("#", "").toLowerCase();

    if (validateHexString(sanitisedHex)) {
      const chars = [...sanitisedHex];
      return [
        parseInt(chars[0] + chars[1], 16),
        parseInt(chars[2] + chars[3], 16),
        parseInt(chars[4] + chars[5], 16),
      ];
    } else {
      throw new Error("Invalid HEX input"); // Error handling
    }
  };

  // Calculate contrast ratio
  const colorContrastRatioCalculator = (foregroundColor: ColorContrastRatioCalculatorInput,
    backgroundColor: ColorContrastRatioCalculatorInput): number => {
    const fg = calculateRelativeLuminance(foregroundColor);
    const bg = calculateRelativeLuminance(backgroundColor);
    if (bg < fg) {
      const ratio = (fg + 0.05) / (bg + 0.05);
      return Math.round((ratio*100))/100;

    } else {
      const ratio = (bg + 0.05) / (fg + 0.05);
      return Math.round((ratio*100))/100;
    }
  };

  // Calculate the user input's relative luminance
  const calculateRelativeLuminance = (input: ColorContrastRatioCalculatorInput): number => {
    if (Array.isArray(input) && input.length === 3) {
      return  calculateRelativeLuminanceComponent2(input);
    } else if (typeof input === 'string') {
      const rgb = convertHexToRgb(input);
      return  calculateRelativeLuminanceComponent2(rgb);
    } else {
      throw new Error('Input value must be a string'); // Error handling
    }
  };

  const calculateRelativeLuminanceComponent1 = (rgbValue: number) => {
    const relativeRgb = rgbValue/255;
    if (relativeRgb <=  0.03928) {
      return relativeRgb/12.92;
    }
    return ((relativeRgb + 0.055) / 1.055) ** 2.4;
  };

  const calculateRelativeLuminanceComponent2 = (input: Array<number>) => {
    return  0.2126 * calculateRelativeLuminanceComponent1(input[0])
      + 0.7152 * calculateRelativeLuminanceComponent1(input[1])
      + 0.0722 * calculateRelativeLuminanceComponent1(input[2]);
  };

  useEffect(() => {
    if (colorContrastRatioCalculator(foreground, background) !== ratio) {
      setRatio(colorContrastRatioCalculator(foreground, background));
    }
  })

  usePropertyMenu(
    [
      {
        itemType: "toggle",
        tooltip: "Dark Mode",
        propertyName: "darkMode",
        icon: ModeIcon,
        isToggled: darkMode
      },
      {
        itemType: "toggle",
        tooltip: "Show Labels",
        propertyName: "showLabels",
        isToggled: showLabels
      },
      {
        itemType: "toggle",
        tooltip: "Horizontal Layout",
        propertyName: "horizontalLayout",
        isToggled: horizontalLayout
      },
    ],
    ({ propertyName }) => {
      switch (propertyName) {
        case "darkMode":
          return setDarkMode(!darkMode);
        case "showLabels":
          return setShowLabels(!showLabels);
        case "horizontalLayout":
          return setHorizontalLayout(!horizontalLayout);
        default:
          throw new Error(`Unexpected property type: ${propertyName}`);
      }
    }
  );

  return (
    <AutoLayout
      fill={darkMode ? "#121212CC" : "#E6E6E6CC"}
      stroke="#FFFFFF26"
      cornerRadius={16}
      direction="vertical"
      spacing={12}
      padding={16}
      width={240}
      verticalAlignItems="center"
      horizontalAlignItems="center"
      effect={[
        {
          blur: 40,
          type: "background-blur",
        },
        {
          type: "drop-shadow",
          color: "#12121233",
          offset: {
            x: 0,
            y: 8,
          },
          blur: 24,
          showShadowBehindNode:
            false,
        },
      ]}
    >
      <AutoLayout
        fill={background}
        stroke={darkMode ? "#FFFFFF1A" : "#0000001A"}
        cornerRadius={8}
        overflow="visible"
        spacing={12}
        padding={{
          vertical: 8,
          horizontal: 12,
        }}
        width={208}
      >
        <Text
          fill={foreground}
          fontFamily="Inter"
          fontSize={28}
          fontWeight={700}
          lineHeight={32}
          width="hug-contents"
        >
          Aa
        </Text>
        <Text
          fill={foreground}
          horizontalAlignText="right"
          fontFamily="Inter"
          fontSize={28}
          fontWeight={500}
          lineHeight={32}
          width="fill-parent"
        >
          {ratio}
        </Text>
      </AutoLayout>

      <AutoLayout
        overflow="visible"
        direction={horizontalLayout ? "horizontal" : "vertical"}
        spacing={12}
        width="fill-parent"
      >
        <AutoLayout
          overflow="visible"
          direction="vertical"
          width="fill-parent"
        >
          <Text
            fill={darkMode ? "#FFF" : "#121212"}
            fontSize={12}
            lineHeight={16}
            fontFamily="Inter"
            letterSpacing={0.3}
            fontWeight={600}
          >
            Foreground
          </Text>
          <Input
            fill={darkMode ? "#FFF" : "#121212"}
            hoverStyle={{opacity: 0.8}}
            fontFamily="Roboto Mono"
            letterSpacing={0.5}
            fontWeight={500}
            fontSize={21}
            lineHeight={28}
            textCase="upper"
            value={foreground}
            onTextEditEnd={(e) => validateForegroundInput(e.characters.trim())}
          />
          {showLabels && (
            <Input
              fill={darkMode ? "#FFF" : "#121212"}
              hoverStyle={{opacity: 0.8}}
              fontFamily="Inter"
              fontWeight={500}
              fontSize={14}
              lineHeight={24}
              placeholder="Label"
              width={208}
              value={foregroundLabel}
              onTextEditEnd={(e) => setForegroundLabel(e.characters.trim())}
            />
          )}
        </AutoLayout>

        <AutoLayout
          overflow="visible"
          direction="vertical"
          width="fill-parent"
        >
          <Text
            name="Label"
            fill={darkMode ? "#FFF" : "#121212"}
            fontSize={12}
            lineHeight={16}
            fontFamily="Inter"
            letterSpacing={0.3}
            fontWeight={600}
          >
            Background
          </Text>
          <Input
            fill={darkMode ? "#FFF" : "#121212"}
            hoverStyle={{opacity: 0.8}}
            fontFamily="Roboto Mono"
            letterSpacing={0.5}
            fontWeight={500}
            fontSize={21}
            lineHeight={28}
            textCase="upper"
            value={background}
            onTextEditEnd={(e) => validateBackgroundInput(e.characters.trim())}
          />
          {showLabels && (
            <Input
              fill={darkMode ? "#FFF" : "#121212"}
              hoverStyle={{opacity: 0.8}}
              fontFamily="Inter"
              fontWeight={500}
              fontSize={14}
              lineHeight={24}
              placeholder="Label"
              width={208}
              value={backgroundLabel}
              onTextEditEnd={(e) => setBackgroundLabel(e.characters.trim())}
            />
          )}
        </AutoLayout>
      </AutoLayout>
    </AutoLayout>
  )
}

widget.register(Widget)