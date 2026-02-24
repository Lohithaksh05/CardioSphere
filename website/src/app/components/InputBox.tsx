import React, { ChangeEvent, useState } from "react";

interface Props {
  placeholder: string;
}

const InputBox: React.FC<Props> = ({ placeholder }) => {
  const [input, setInput] = useState("");

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  return (
    <input
      value={input}
      onChange={handleInputChange}
      className="m-1 px-4 py-2 rounded-xl border-[1px] border-white focus:border-red focus:outline-none relative transition-all bg-[var(--background)] placeholder-[var(--placeholder)] w-full border-[var(--gray)] hover:border-[var(--gray-hover)]"
      placeholder={placeholder}
      style={{ userSelect: "none", cursor: "text" }}
    />
  );
};

export default InputBox;
