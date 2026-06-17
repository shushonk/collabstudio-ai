export const Formatting = {
  apply: (textarea: HTMLTextAreaElement, type: string) => {
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);
    
    let replacement = "";
    let cursorOffset = 0;

    switch (type) {
      case "bold":
        replacement = `**${selected}**`;
        cursorOffset = selected ? 0 : 2;
        break;
      case "italic":
        replacement = `*${selected}*`;
        cursorOffset = selected ? 0 : 1;
        break;
      case "underline":
        replacement = `<u>${selected}</u>`;
        cursorOffset = selected ? 0 : 3;
        break;
      case "strike":
        replacement = `~~${selected}~~`;
        cursorOffset = selected ? 0 : 2;
        break;
      case "list":
        replacement = selected.split("\n").map(line => `- ${line}`).join("\n");
        break;
      case "code":
        replacement = `\`${selected}\``;
        cursorOffset = selected ? 0 : 1;
        break;
      case "quote":
        replacement = selected.split("\n").map(line => `> ${line}`).join("\n");
        break;
      case "link":
        replacement = `[${selected}](url)`;
        cursorOffset = selected ? 3 : 1;
        break;
      default:
        replacement = selected;
    }

    const newValue = text.substring(0, start) + replacement + text.substring(end);
    return {
      value: newValue,
      newCursorPos: start + replacement.length - cursorOffset
    };
  }
};
