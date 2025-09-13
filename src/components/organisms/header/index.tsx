import React from "react";

type Props = {
  title: string;
  children?: React.ReactNode;
};

function Header({ title, children }: Props) {
  return (
    <div className="text-xl font-bold bg-neutral-900 p-4 flex justify-between items-center">
      <span>{title}</span>
      {children}
    </div>
  );
}

export default Header;
