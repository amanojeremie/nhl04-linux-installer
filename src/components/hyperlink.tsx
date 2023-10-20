import { Command } from "@tauri-apps/api/shell";

export interface HyperlinkProps {
  children: React.ReactNode,
  href: string,
}

// Links do not work when compiled as an AppImage. Use xdg-open with different env vars as a workaround.
function Hyperlink({children, href}: HyperlinkProps) {
  const onClickHandler = async() => {
    const openCommand = Command.sidecar('.sidecar/nhl-04-xdg-open', [
      href
    ]);
    await openCommand.execute();
  }
  return (
    <a href={href} onClick={
      (e) => {
        e.preventDefault();
        onClickHandler();
      }
    }>
      {children}
    </a>
  );
}
export default Hyperlink; 