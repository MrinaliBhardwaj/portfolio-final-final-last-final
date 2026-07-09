// Ported from the pasted shadcn/Tailwind/TypeScript file-tree component into
// this project's plain React + CSS stack (no Tailwind, no TS, no @/lib/utils
// alias here) — same porting approach as Dock.jsx. The recursive structure,
// state (isOpen/isHovered per node), expand/collapse toggle, and hover
// affordances are unchanged from the source. The only additions are what the
// integration requires: a file can carry a `sectionId` and, when clicked,
// call `onSelectFile` to navigate the Tech page to that section; `activeId`
// lets the currently-viewed section's file read as selected.
import { useState } from "react";

function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

const FILE_ICONS = {
  tsx: { color: "ft-ext-tsx", icon: "⚛" },
  ts: { color: "ft-ext-ts", icon: "◆" },
  jsx: { color: "ft-ext-tsx", icon: "⚛" },
  js: { color: "ft-ext-js", icon: "◆" },
  css: { color: "ft-ext-css", icon: "◈" },
  json: { color: "ft-ext-json", icon: "{}" },
  md: { color: "ft-ext-muted", icon: "◊" },
  svg: { color: "ft-ext-svg", icon: "◐" },
  png: { color: "ft-ext-png", icon: "◑" },
  default: { color: "ft-ext-muted", icon: "◇" },
};

function getFileIcon(extension) {
  return FILE_ICONS[extension || "default"] || FILE_ICONS.default;
}

function FileItem({ node, depth, isLast, parentPath, onSelectFile, activeId }) {
  const [isOpen, setIsOpen] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  const isFolder = node.type === "folder";
  const hasChildren = isFolder && node.children && node.children.length > 0;
  const fileIcon = getFileIcon(node.extension);
  const isActive = !isFolder && node.sectionId && node.sectionId === activeId;

  const handleClick = () => {
    if (isFolder) {
      setIsOpen((v) => !v);
    } else if (node.sectionId && onSelectFile) {
      onSelectFile(node.sectionId);
    }
  };

  return (
    <div className="select-none">
      <div
        className={cx(
          "ft-row",
          isHovered && "ft-row--hover",
          isActive && "ft-row--active"
        )}
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        {/* tree line */}
        {depth > 0 && (
          <div
            className="ft-line-slot"
            style={{ left: `${(depth - 1) * 16 + 16}px` }}
          >
            <div className={cx("ft-line", isHovered && "ft-line--hover")} />
          </div>
        )}

        {/* folder chevron / file glyph */}
        <div className={cx("ft-chevron", isFolder && isOpen && "ft-chevron--open")}>
          {isFolder ? (
            <svg
              width="6"
              height="8"
              viewBox="0 0 6 8"
              fill="none"
              className={cx("ft-chevron-icon", isHovered && "ft-chevron-icon--hover")}
            >
              <path
                d="M1 1L5 4L1 7"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <span className={cx("ft-glyph", fileIcon.color)}>{fileIcon.icon}</span>
          )}
        </div>

        {/* folder/file icon */}
        <div
          className={cx(
            "ft-icon",
            isFolder
              ? isHovered
                ? "ft-icon--folder ft-icon--hover"
                : "ft-icon--folder"
              : cx(fileIcon.color, isHovered ? "ft-icon--hover" : "ft-icon--dim")
          )}
        >
          {isFolder ? (
            <svg width="16" height="14" viewBox="0 0 16 14" fill="currentColor">
              <path d="M1.5 1C0.671573 1 0 1.67157 0 2.5V11.5C0 12.3284 0.671573 13 1.5 13H14.5C15.3284 13 16 12.3284 16 11.5V4.5C16 3.67157 15.3284 3 14.5 3H8L6.5 1H1.5Z" />
            </svg>
          ) : (
            <svg width="14" height="16" viewBox="0 0 14 16" fill="currentColor" opacity="0.8">
              <path d="M1.5 0C0.671573 0 0 0.671573 0 1.5V14.5C0 15.3284 0.671573 16 1.5 16H12.5C13.3284 16 14 15.3284 14 14.5V4.5L9.5 0H1.5Z" />
              <path d="M9 0V4.5H14" fill="currentColor" fillOpacity="0.5" />
            </svg>
          )}
        </div>

        {/* name */}
        <span
          className={cx(
            "ft-name",
            isActive && "ft-name--active",
            isFolder
              ? isHovered
                ? "ft-name--bright"
                : "ft-name--folder"
              : isHovered
                ? "ft-name--bright"
                : "ft-name--dim"
          )}
        >
          {node.name}
        </span>

        {/* hover indicator */}
        <div className={cx("ft-dot", isHovered && "ft-dot--visible")} />
      </div>

      {hasChildren && (
        <div
          className={cx("ft-children", isOpen ? "ft-children--open" : "ft-children--closed")}
          style={{ maxHeight: isOpen ? `${node.children.length * 100}px` : "0px" }}
        >
          {node.children.map((child, index) => (
            <FileItem
              key={child.name}
              node={child}
              depth={depth + 1}
              isLast={index === node.children.length - 1}
              parentPath={[...parentPath, !isLast]}
              onSelectFile={onSelectFile}
              activeId={activeId}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function FileTree({ data, className, onSelectFile, activeId }) {
  return (
    <div className={cx("ft", className)}>
      <div className="ft-header">
        <div className="ft-dots">
          <div className="ft-dot-lamp ft-dot-lamp--red" />
          <div className="ft-dot-lamp ft-dot-lamp--amber" />
          <div className="ft-dot-lamp ft-dot-lamp--green" />
        </div>
        <span className="ft-header-label">explorer</span>
      </div>

      <div className="ft-tree">
        {data.map((node, index) => (
          <FileItem
            key={node.name}
            node={node}
            depth={0}
            isLast={index === data.length - 1}
            parentPath={[]}
            onSelectFile={onSelectFile}
            activeId={activeId}
          />
        ))}
      </div>
    </div>
  );
}
