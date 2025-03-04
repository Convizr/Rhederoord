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
  
      // 3) Build the style + container + blocks all in one HTML string
      const styleString = `
        <style>
          .source-blocks-container {
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
            font-family: Arial, sans-serif;
          }
          .source-block {
            background: #DCE0EF;
            color: #000;
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
            /* 
              If you want a cursor pointer or something on hover, uncomment:
              cursor: pointer;
            */
          }
        </style>
      `;
  
      // 4) Build the blocks
      const blocksHtml = dataChunks.map(chunk => {
        const { content, source } = chunk;
        // Truncate content to ~80 chars
        const summary = content && content.length > 80
          ? content.substring(0, 80) + "..."
          : (content || "");
  
        const sourceName = source?.name || "Unknown Source";
        const sourceType = source?.type || "unknown";
  
        // Add title attribute for hover tooltip
        return `
          <div class="source-block">
            <div class="summary-text">${summary}</div>
            <div class="source-row">
              <div class="source-type-icon">
                ${sourceType === "pdf" ? "📄" : "ℹ️"}
              </div>
              <div 
                class="source-name" 
                title="${sourceName}"
              >
                ${sourceName}
              </div>
            </div>
          </div>
        `;
      }).join("");
  
      // 5) Combine style + container + blocks
      const finalHtml = `
        ${styleString}
        <div class="source-blocks-container">
          ${blocksHtml}
        </div>
      `;
  
      // 6) Set element.innerHTML to the combined HTML
      element.innerHTML = finalHtml;
    },
  };  