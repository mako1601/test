import * as THREE from 'three';
import { /*mergeAttributes,*/ Node } from '@tiptap/core';

export interface CodeRunnerOptions {
  languageClassPrefix: string;
  defaultLanguage: string | null | undefined;
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    codeRunner: {
      setCodeRunner: (attributes?: { language: string }) => ReturnType;
      toggleCodeRunner: (attributes?: { language: string }) => ReturnType;
      executeCode: () => ReturnType;
    };
  }
}

export const CodeRunner = Node.create<CodeRunnerOptions>({
  name: 'codeRunner',
  content: 'text*',
  marks: '',
  group: 'block',
  code: true,
  defining: true,

  addOptions() {
    return {
      languageClassPrefix: 'language-',
      defaultLanguage: null,
      HTMLAttributes: {}
    };
  },

  addAttributes() {
    return {
      language: {
        default: this.options.defaultLanguage,
        parseHTML: (element) => {
          const { languageClassPrefix } = this.options;
          const classNames = [...(element.firstElementChild?.classList || [])];
          const languages = classNames
            .filter((className) => className.startsWith(languageClassPrefix))
            .map((className) => className.replace(languageClassPrefix, ''));
          return languages[0] || null;
        },
        rendered: false,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'pre',
        preserveWhitespace: 'full',
        getAttrs: () => ({
          'data-type': 'code-runner'
        })
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      'pre',
      { ...HTMLAttributes, 'data-type': 'code-runner' },
      // mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
      [
        'code',
        {
          class: node.attrs.language
            ? this.options.languageClassPrefix + node.attrs.language
            : null,
        },
        0,
      ]
    ];
  },

  addCommands() {
    return {
      setCodeRunner:
        (attributes) => ({ commands }) => {
          return commands.setNode(this.name, attributes);
        },
      toggleCodeRunner:
        attributes => ({ commands }) => {
          return commands.toggleNode(this.name, 'paragraph', attributes)
        },
      executeCode:
        () => ({ state }) => {
          const { selection } = state;
          const { $from } = selection;
          const parentNode = $from.parent;
          if (parentNode && parentNode.type.name === 'codeRunner') {
            const code = parentNode.textContent || '';
            const canvas = document.createElement('canvas');
            canvas.width = 800;
            canvas.height = 600;

            const onCanvasGenerated = (window as any).onCanvasGenerated;
            if (typeof onCanvasGenerated === 'function') {
              onCanvasGenerated(canvas);
            }

            try {
              const func = new Function('THREE', 'canvas', code);
              func(THREE, canvas);
            } catch (error) {
              console.error('Error executing code:', error);
            }
          }
          return true;
        }
    };
  }
});
