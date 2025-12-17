import { useState, useRef, useEffect } from "react";
import type { ComponentProps } from "react";
import SidebarButton from "./SidebarButton";
import { Icon, HStack, Collapsible } from "@chakra-ui/react";
import { LuChevronRight } from "react-icons/lu";

interface Props extends ComponentProps<typeof SidebarButton> {
  icon: React.ElementType;
  label: string;
}

const SidebarDropdownButton = ({ icon, label, children, ...props }: Props) => {
  const [isOpen, setIsOpen] = useState(false);

  const contentRef = useRef<HTMLDivElement | null>(null);

  // Handle height animation for the dropdown content.
  useEffect(() => {
    // Animate height on isOpen change using only the content ref.
    const el = contentRef.current;
    if (!el) return;

    // Initial styles for animation.
    el.style.overflow = "hidden";
    el.style.transition = "height 100ms ease";

    // After transition, set height to auto if open.
    const handleTransitionEnd = () => {
      if (isOpen) el.style.height = "auto";
    };

    // Listen for transition end to adjust height.
    el.addEventListener("transitionend", handleTransitionEnd);

    // Trigger height change.
    if (isOpen) el.style.height = `${el.scrollHeight}px`;
    else {
      // If closing, first set height to current scrollHeight to enable transition.
      if (el.style.height === "auto") {
        el.style.height = `${el.scrollHeight}px`;
        el.offsetHeight;
      }

      // Then set height to 0 to close.
      el.style.height = "0px";
    }

    // Handle window resize to adjust height if open.
    const onResize = () => {
      if (isOpen) el.style.height = `${el.scrollHeight}px`;
    };

    // Add resize listener.
    window.addEventListener("resize", onResize);

    // Cleanup listeners on unmount or dependency change.
    return () => {
      window.removeEventListener("resize", onResize);
      el.removeEventListener("transitionend", handleTransitionEnd);
    };
  }, [isOpen, children]);

  return (
    <Collapsible.Root defaultOpen width={"100%"}>
      <Collapsible.Trigger asChild width={"100%"}>
        <SidebarButton
          width="100%"
          {...props}
          onClick={() => setIsOpen(!isOpen)}
        >
          <HStack gap="3" width="100%">
            <Icon as={icon} />
            <span>{label}</span>
          </HStack>
          <Collapsible.Indicator
            transition="transform 0.2s"
            _open={{ transform: "rotate(90deg)" }}
          >
            <LuChevronRight />
          </Collapsible.Indicator>
        </SidebarButton>
      </Collapsible.Trigger>
      <Collapsible.Content>{children}</Collapsible.Content>
    </Collapsible.Root>
  );
};

export default SidebarDropdownButton;
