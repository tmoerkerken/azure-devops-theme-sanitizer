const getHTMLFromClipboardContents = async (clipboardContents) => {
  const blobs = { 'text/html': null, 'text/plain': null };
  for (const item of clipboardContents) {
    if (item.types.includes("text/html")) {
      const blob = await item.getType("text/html");
      const blobText = await blob.text();
      blobs['text/html'] = blobText
    }
    if (item.types.includes("text/plain")) {
      const blob = await item.getType("text/plain");
      const blobText = await blob.text();
      blobs['text/plain'] = blobText
    }
  }

  return blobs;
}

const spawnNotification = (count) => {
  document.getElementById("sanitizerCount").innerText = count;
  document.getElementById("clipboardSanitizerNotification").style.display = 'inline';
  setTimeout(() => { document.getElementById("clipboardSanitizerNotification").style.display = 'none' }, 2000);
}

const sanitizeClipboard = async () => {
  const clipboard = await navigator.clipboard.read();
  let result = await getHTMLFromClipboardContents(clipboard);

  if (!result['text/html']) {
    return;
  }

  const re = new RegExp("(color:[\s]?)(.*?)(;)", "gm");
  const problemCount = [...result['text/html'].matchAll(re)].length;
  if (problemCount) {
    result['text/html'] = result['text/html'].replace(re, "$1 inherit$3");
    spawnNotification(problemCount);

    navigator.clipboard.write([new ClipboardItem({
      'text/plain': new Blob([result['text/plain']], { type: 'text/plain' }),
      'text/html': new Blob([result['text/html']], { type: 'text/html' })
    })])
  }
}

const styles = /*css*/`
  #clipboardSanitizerNotification {
    position:fixed;
    left:0;
    right:0;
    bottom: 0;
    z-index: 9999999;
    padding: 1rem 2rem;
    background: #7fb76f;
    border-radius: 0.5rem;
    font-family: Arial;
    box-shadow: 0px 3px 3px rgba(0, 0, 0, 0.5);
    margin: 3% auto;
    max-width: 500px;
    text-align: center;
    display: none;
  }
`;

document.getElementsByTagName('body')[0].insertAdjacentHTML(
  'beforeBegin', `
    <div id="clipboardSanitizerNotification">
      <span id="sanitizerCount">x</span> theme related problem(s) were fixed in the clipboard!
    </div>
  `
);
console.log("Azure DevOps Clipboard Sanitizer loaded!")

window.addEventListener('keydown', function (e) {
  if ((e.metaKey || e.ctrlKey) && (e.key === "c" || e.key === "x")) {
    // Command/Ctrl + c/x pressed
    sanitizeClipboard();
  }
});

const styleSheet = document.createElement("style")
styleSheet.innerText = styles
document.head.appendChild(styleSheet)