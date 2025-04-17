"use client";
import { Editor } from '@tinymce/tinymce-react';
import React, { useRef, useState, useEffect } from 'react';
import { Editor as TinyMCEEditor } from 'tinymce';

const TextEditor = ({setDescription}: any) => {
  const [isClient, setIsClient] = useState(false);
  const editorRef = useRef<TinyMCEEditor | null>(null);

  useEffect(() => {
    // Check if we're running in the client-side (browser)
    setIsClient(typeof window !== 'undefined');
  }, []);

  const handleEditorChange = (content: string) => {
    setDescription(content)
  };

  // Render null during SSR to avoid mismatch
  if (!isClient) {
    return null;
  }

  return (
    <Editor
      apiKey="cn7fp4jgljz9ci9zxpjsxt8kyi7i4370grt9ktu6lxke03eo"
      onInit={(evt, editor) => {
        editorRef.current = editor;
      }}
      init={{
        height: 250,
        menubar: false,
        statusbar: false,
        toolbar: 'fontfamily fontsizeinput blocks forecolor  bold italic underline  alignleft aligncenter alignright   undo redo    ', 
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
          });
        }
      }}
      onEditorChange={handleEditorChange}
    />
  );
};

export default TextEditor;


