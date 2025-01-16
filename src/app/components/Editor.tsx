// "use client"
// import React, { useState } from 'react';
// import { Bold, Italic, Underline, Link, Code, AlignLeft, AlignCenter, AlignRight, Undo, Redo } from 'lucide-react';

// const TextEditor = () => {
//   const [text, setText] = useState('');

//   const handleCommand = (command: string) => {
//     document.execCommand(command, false);
//   };

//   return (
//     <div className="w-full max-w-4xl border border-gray-300 rounded-lg">
//       {/* Toolbar */}
//       <div className="flex items-center gap-1 p-2 border-b border-gray-300 bg-gray-50">
//         {/* Font dropdown */}
//         <select 
//           className="h-8 px-2 border border-gray-300 rounded-md bg-white text-sm"
//           onChange={(e) => document.execCommand('fontName', false, e.target.value)}
//         >
//           <option value="Normal">Normal</option>
//           <option value="Arial">Arial</option>
//           <option value="Times New Roman">Times New Roman</option>
//           <option value="Courier New">Courier New</option>
//         </select>

//         {/* Formatting buttons */}
//         <div className="flex items-center gap-1 px-2 border-l border-r border-gray-300">
//           <button
//             className="p-1 hover:bg-gray-200 rounded"
//             onClick={() => handleCommand('bold')}
//             title="Bold"
//           >
//             <Bold size={18} />
//           </button>
//           <button
//             className="p-1 hover:bg-gray-200 rounded"
//             onClick={() => handleCommand('italic')}
//             title="Italic"
//           >
//             <Italic size={18} />
//           </button>
//           <button
//             className="p-1 hover:bg-gray-200 rounded"
//             onClick={() => handleCommand('underline')}
//             title="Underline"
//           >
//             <Underline size={18} />
//           </button>
//         </div>

//         {/* Alignment buttons */}
//         <div className="flex items-center gap-1 px-2 border-r border-gray-300">
//           <button
//             className="p-1 hover:bg-gray-200 rounded"
//             onClick={() => handleCommand('justifyLeft')}
//             title="Align Left"
//           >
//             <AlignLeft size={18} />
//           </button>
//           <button
//             className="p-1 hover:bg-gray-200 rounded"
//             onClick={() => handleCommand('justifyCenter')}
//             title="Align Center"
//           >
//             <AlignCenter size={18} />
//           </button>
//           <button
//             className="p-1 hover:bg-gray-200 rounded"
//             onClick={() => handleCommand('justifyRight')}
//             title="Align Right"
//           >
//             <AlignRight size={18} />
//           </button>
//         </div>

//         {/* Insert buttons */}
//         <div className="flex items-center gap-1 px-2 border-r border-gray-300">
//           <button
//             className="p-1 hover:bg-gray-200 rounded"
//             onClick={() => handleCommand('createLink')}
//             title="Insert Link"
//           >
//             <Link size={18} />
//           </button>
//           <button
//             className="p-1 hover:bg-gray-200 rounded"
//             onClick={() => handleCommand('insertCode')}
//             title="Insert Code"
//           >
//             <Code size={18} />
//           </button>
//         </div>

//         {/* Undo/Redo buttons */}
//         <div className="flex items-center gap-1">
//           <button
//             className="p-1 hover:bg-gray-200 rounded"
//             onClick={() => handleCommand('undo')}
//             title="Undo"
//           >
//             <Undo size={18} />
//           </button>
//           <button
//             className="p-1 hover:bg-gray-200 rounded"
//             onClick={() => handleCommand('redo')}
//             title="Redo"
//           >
//             <Redo size={18} />
//           </button>
//         </div>
//       </div>

//       {/* Editor area */}
//       <div
//         className="min-h-[200px] p-4 focus:outline-none"
//         contentEditable={true}
//         onInput={(e) => setText(e.currentTarget.textContent || '')}
//         dangerouslySetInnerHTML={{ __html: text }}
//       />
//     </div>
//   );
// };

// export default TextEditor;


// "use client"
// import { Editor } from '@tinymce/tinymce-react';
// import React, { useRef } from 'react';

// const TextEditor = () => {
//   const editorRef = useRef<Editor | null>(null);

//   const handleEditorChange = (content: string) => {
//     console.log('Editor content:', content);
//   };

//   return (
//     <Editor
//       apiKey="your-tiny-mce-api-key" // Sign up at tiny.cloud to get your free API key
//       onInit={(evt, editor) => {
//         if (editorRef.current) {
//           (editorRef.current as any) = editor;
//         }
//       }}
//       init={{
//         height: 300,
//         menubar: false,
//         statusbar: false,
//         plugins: [],
//         toolbar: 'fontfamily bold italic underline alignleft aligncenter alignright link code undo redo',
//         toolbar_location: 'top',
//         content_css: 'default',
//         font_family_formats: 'Normal=arial,helvetica,sans-serif;' +
//           'Sans Serif=sans-serif;' +
//           'Serif=serif;' +
//           'Monospace=monospace',
//         content_style: `
//           body { 
//             font-family: arial,helvetica,sans-serif;
//             font-size: 14px;
//             margin: 0;
//             padding: 16px;
//           }
//         `,
//         toolbar_style: 'padding: 8px;',
//         setup: (editor) => {
//           editor.on('keyup', () => {
//             console.log('Current content:', editor.getContent());
//           });
//         }
//       }}
//       onEditorChange={handleEditorChange}
//     />
//   );
// };

// export default TextEditor;

// "use client"

// import { Editor } from '@tinymce/tinymce-react';
// import React, { useRef } from 'react';
// const TextEditor = () => {
//   const editorRef = useRef<any>(null);

//   const handleEditorChange = (content: string) => {
//     console.log('Editor content:', content);
//   };

//   return (
//     <Editor
//       apiKey="dlpliwqcoggv1fdi4zy7xbju5vd8dkqmhepsf0jnqcdy7km6"
//       onInit={(evt, editor) => editorRef.current = editor}
//       init={{
//         height: 300,
//         menubar: false,
//         statusbar: false,
//         plugins: [],
//         toolbar: 'fontfamily bold italic underline alignleft aligncenter alignright link code undo redo',
//         toolbar_location: 'top',
//         content_css: 'default',
//         font_family_formats: 'Normal=arial,helvetica,sans-serif;' +
//           'Sans Serif=sans-serif;' +
//           'Serif=serif;' +
//           'Monospace=monospace',
//         content_style: `
//           body { 
//             font-family: arial,helvetica,sans-serif;
//             font-size: 14px;
//             margin: 0;
//             padding: 16px;
//           }
//         `,
//         toolbar_style: 'padding: 8px;',
//         setup: (editor) => {
//           editor.on('keyup', () => {
//             console.log('Current content:', editor.getContent());
//           });
//         }
//       }}
//       onEditorChange={handleEditorChange}
//     />
//   );
// };

// export default TextEditor;
// "use client"
// import { Editor } from '@tinymce/tinymce-react';
// import React, { useRef } from 'react';

// // Import the correct type for the editor instance
// import { Editor as TinyMCEEditor } from 'tinymce';

// const TextEditor = () => {
//   // Specify the type for useRef to avoid the 'any' type
//   const editorRef = useRef<TinyMCEEditor | null>(null);

//   const handleEditorChange = (content: string) => {
//     console.log('Editor content:', content);
//   };

//   return (
//     <Editor
//       apiKey="dlpliwqcoggv1fdi4zy7xbju5vd8dkqmhepsf0jnqcdy7km6"
//       onInit={(evt, editor) => {
//         // Assign the editor to the ref with proper type
//         editorRef.current = editor;
//       }}
//       init={{
//         height: 300,
//         menubar: false,
//         statusbar: false,
//         plugins: [],
//         toolbar: 'fontfamily bold italic underline alignleft aligncenter alignright link code undo redo',
//         toolbar_location: 'top',
//         content_css: 'default',
//         font_family_formats: 'Normal=arial,helvetica,sans-serif;' +
//           'Sans Serif=sans-serif;' +
//           'Serif=serif;' +
//           'Monospace=monospace',
//         content_style: `
//           body { 
//             font-family: arial,helvetica,sans-serif;
//             font-size: 14px;
//             margin: 0;
//             padding: 16px;
//           }
//         `,
//         toolbar_style: 'padding: 8px;',
//         setup: (editor) => {
//           editor.on('keyup', () => {
//             console.log('Current content:', editor.getContent());
//           });
//         }
//       }}
//       onEditorChange={handleEditorChange}
//     />
//   );
// };

// export default TextEditor;

"use client"
import { Editor } from '@tinymce/tinymce-react';
import React, { useRef } from 'react';

// Import the correct type for the editor instance
import { Editor as TinyMCEEditor } from 'tinymce';

const TextEditor = () => {
  // Specify the type for useRef to avoid the 'any' type
  const editorRef = useRef<TinyMCEEditor | null>(null);

  const handleEditorChange = (content: string) => {
    console.log('Editor content:', content);
  };

  return (
    <Editor
      apiKey="dlpliwqcoggv1fdi4zy7xbju5vd8dkqmhepsf0jnqcdy7km6"
      onInit={(evt, editor) => {
        editorRef.current = editor;
      }}
      init={{
        height: 250,
        menubar: false,
        statusbar: false,
        plugins: ['fontsize'],
        toolbar: 'fontfamily fontsize bold italic underline alignleft aligncenter alignright link code undo redo', // Add fontsize option to toolbar
        toolbar_location: 'top',
        content_css: 'default',
        font_family_formats: 'Normal=arial,helvetica,sans-serif;' +
          'Sans Serif=sans-serif;' +
          'Serif=serif;' +
          'Monospace=monospace',
        content_style: `
          body { 
            font-family: arial,helvetica,sans-serif;
            font-size: 14px;
            margin: 0;
            padding: 16px;
          }
        `,
        toolbar_style: 'padding: 8px; color:"red"',
        setup: (editor) => {
          editor.on('keyup', () => {
            console.log('Current content:', editor.getContent());
          });
        }
      }}
      onEditorChange={handleEditorChange}
    />
  );
};

export default TextEditor;
