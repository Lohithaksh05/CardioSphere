import React, { Fragment, useRef, useEffect } from "react";

type Props = {
  choices: string[];
  selectedChoice: string;
  setSelectedChoice: any;
};

const Choices = ({ choices, selectedChoice, setSelectedChoice }: Props) => {
  const handleChoiceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedChoice(event.target.value);
  };

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        const focusedElement = document.activeElement as HTMLElement;
        if (containerRef.current?.contains(focusedElement)) {
          setSelectedChoice(focusedElement.getAttribute("data-choice") || "");
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [setSelectedChoice]);

  return (
    <div ref={containerRef} className="flex flex-wrap">
      {choices.map((choice) => (
        <Fragment key={choice}>
          <input
            type="radio"
            id={`choice-${choice}`}
            name="choice"
            value={choice}
            checked={selectedChoice === choice}
            onChange={handleChoiceChange}
            className="hidden"
          />
          <div
            className={`m-1 px-4 py-2 rounded-xl border-[1px] focus:border-red focus:outline-none relative transition-all ${
              selectedChoice === choice
                ? "bg-red bg-opacity-25 hover:bg-opacity-35 border-red"
                : "hover:bg-gray-hover hover:border-gray-hover bg-gray border-gray"
            }`}
            tabIndex={0}
            data-choice={choice}
            onClick={(event) => {
              event.preventDefault();
              setSelectedChoice(choice);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                setSelectedChoice(choice);
              }
            }}
            style={{ userSelect: "none", cursor: "pointer" }}
          >
            {choice}
          </div>
        </Fragment>
      ))}
    </div>
  );
};

export default Choices;
