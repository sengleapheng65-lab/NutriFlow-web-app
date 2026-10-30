type MacroIconType = "protein" | "carbs" | "fat";

type MacroIconProps = {
  type: MacroIconType;
};

function MacroIcon({ type }: MacroIconProps) {
  return (
    <svg
      className="macro-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {type === "protein" && (
        <path d="m13 2-8 11h6l-1 9 9-12h-6z" />
      )}
      {type === "carbs" && (
        <>
          <path d="M12 21V3" />
          <path d="M12 7c-3 0-4-2-4-3 3 0 4 2 4 3ZM12 11c3 0 4-2 4-3-3 0-4 2-4 3Z" />
          <path d="M12 15c-3 0-4-2-4-3 3 0 4 2 4 3ZM12 19c3 0 4-2 4-3-3 0-4 2-4 3Z" />
        </>
      )}
      {type === "fat" && <path d="M12 3s5 5.3 5 10a5 5 0 0 1-10 0c0-4.7 5-10 5-10Z" />}
    </svg>
  );
}

export default MacroIcon;
