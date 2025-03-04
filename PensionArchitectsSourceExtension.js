export const SourceBlocksExtension = {
    name: "SourceBlocks",
    type: "response",
    match: ({ trace }) =>
      trace.type === "Custom_SourceBlocks" ||
      (trace.payload && trace.payload.name === "Custom_SourceBlocks"),
    render: ({ trace, element }) => {
      // 1) Convert the entire trace.payload from string -> object
      let payloadObj;
      if (typeof trace.payload === "string") {
        try {
          payloadObj = JSON.parse(trace.payload);
        } catch (err) {
          console.error("Error parsing entire trace.payload:", err);
          payloadObj = {};
        }
      } else {
        // If it's already an object
        payloadObj = trace.payload || {};
      }
      console.log("Parsed payloadObj:", payloadObj);
  
      // 2) Now parse dataChunks if it’s a string
      let dataChunks = [];
      if (typeof payloadObj.dataChunks === "string") {
        try {
          dataChunks = JSON.parse(payloadObj.dataChunks);
        } catch (err) {
          console.error("Error parsing payloadObj.dataChunks:", err);
        }
      } else if (Array.isArray(payloadObj.dataChunks)) {
        dataChunks = payloadObj.dataChunks;
      }
      console.log("Final dataChunks:", dataChunks);
  
      // 3) Inject styling
      const styleTag = document.createElement("style");
      styleTag.textContent = `
        .source-blocks-container {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          font-family: Arial, sans-serif;
        }
        .source-block {
          background: #1e1e1e;
          color: #eee;
          border: 1px solid #333;
          border-radius: 8px;
          padding: 12px;
          width: 250px;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          gap: 8px;
        }
        .summary-text {
          font-size: 14px;
          line-height: 1.3em;
          margin-bottom: 8px;
          overflow: hidden;
        }
        .source-row {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 14px;
        }
        .source-type-icon {
          font-size: 16px;
        }
        .source-name {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          flex: 1;
        }
      `;
      document.head.appendChild(styleTag);
  
      // 4) Create the container
      const container = document.createElement("div");
      container.classList.add("source-blocks-container");
  
      // 5) Build each block
      dataChunks.forEach((chunk) => {
        const { content, source } = chunk;
        const summary = (content && content.length > 80)
          ? content.substring(0, 80) + "..."
          : (content || "");
  
        const sourceName = source?.name || "Unknown Source";
        const sourceType = source?.type || "unknown";
  
        // Create the block element
        const block = document.createElement("div");
        block.classList.add("source-block");
        block.innerHTML = `
          <div class="summary-text">${summary}</div>
          <div class="source-row">
            <div class="source-type-icon">
              ${sourceType === "pdf" ? "📄" : "ℹ️"}
            </div>
            <div class="source-name">${sourceName}</div>
          </div>
        `;
        container.appendChild(block);
      });
  
      // 6) Attach to the DOM
      element.appendChild(container);
    },
  };  