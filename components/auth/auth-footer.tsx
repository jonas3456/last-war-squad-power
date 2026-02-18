export function AuthFooter() {
  return (
    <div className="mt-6 flex items-center justify-center gap-4 text-xs text-muted-foreground">
      <a
        href="https://github.com/jonas3456/last-war-squad-power/blob/main/USER_GUIDE.md"
        target="_blank"
        rel="noopener noreferrer"
        className="hover:text-foreground transition-colors"
      >
        User Guide
      </a>
      <span>·</span>
      <a
        href="https://github.com/jonas3456/last-war-squad-power"
        target="_blank"
        rel="noopener noreferrer"
        className="hover:text-foreground transition-colors"
      >
        GitHub
      </a>
      <span>·</span>
      <span>GPL v3.0</span>
    </div>
  );
}
