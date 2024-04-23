import { title } from "@/components/primitives";

interface HeaderProps {
  first: string;
  second: string;
}

export const Header: React.FC<HeaderProps> = ({ first, second }) => {
  return (
    <header className="flex flex-row mb-10">
      <h1 className={title({ size: "xl" })}>{first}&nbsp;</h1>
      <h1
        className={title({
          color: "violet",
          size: "xl",
          class:
            "text-transparent bg-clip-text bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500",
        })}
      >
        {second}&nbsp;
      </h1>
      <br />
    </header>
  );
};
