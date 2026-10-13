'use client';

import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import {
    Bold, Italic, List, ListOrdered, Link as LinkIcon,
    Type, Underline as UnderlineIcon, Undo, Redo
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { clsx } from 'clsx';

type Props = {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
};

const MenuBar = ({ editor }: { editor: Editor | null }) => {
    const t = useTranslations('richText');
    if (!editor) return null;

    const setLink = () => {
        const previousUrl = editor.getAttributes('link').href;
        const url = window.prompt(t('linkPrompt'), previousUrl);

        if (url === null) return;
        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }

        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    };

    return (
        <div className="flex flex-wrap items-center gap-1 border-b border-border bg-surface-elevated/50 p-1.5 px-2">
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={clsx(
                    "rounded-md p-1.5 transition-colors hover:bg-surface",
                    editor.isActive('bold') ? "bg-surface text-primary" : "text-foreground-muted"
                )}
                title={t('bold')}
            >
                <Bold className="h-4 w-4" />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={clsx(
                    "rounded-md p-1.5 transition-colors hover:bg-surface",
                    editor.isActive('italic') ? "bg-surface text-primary" : "text-foreground-muted"
                )}
                title={t('italic')}
            >
                <Italic className="h-4 w-4" />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                className={clsx(
                    "rounded-md p-1.5 transition-colors hover:bg-surface",
                    editor.isActive('underline') ? "bg-surface text-primary" : "text-foreground-muted"
                )}
                title={t('underline')}
            >
                <UnderlineIcon className="h-4 w-4" />
            </button>
            <div className="mx-1 h-4 w-px bg-border" />
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                className={clsx(
                    "rounded-md p-1.5 transition-colors hover:bg-surface",
                    editor.isActive('heading', { level: 3 }) ? "bg-surface text-primary" : "text-foreground-muted"
                )}
                title={t('heading')}
            >
                <Type className="h-4 w-4" />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={clsx(
                    "rounded-md p-1.5 transition-colors hover:bg-surface",
                    editor.isActive('bulletList') ? "bg-surface text-primary" : "text-foreground-muted"
                )}
                title={t('bulletList')}
            >
                <List className="h-4 w-4" />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={clsx(
                    "rounded-md p-1.5 transition-colors hover:bg-surface",
                    editor.isActive('orderedList') ? "bg-surface text-primary" : "text-foreground-muted"
                )}
                title={t('orderedList')}
            >
                <ListOrdered className="h-4 w-4" />
            </button>
            <div className="mx-1 h-4 w-px bg-border" />
            <button
                type="button"
                onClick={setLink}
                className={clsx(
                    "rounded-md p-1.5 transition-colors hover:bg-surface",
                    editor.isActive('link') ? "bg-surface text-primary" : "text-foreground-muted"
                )}
                title={t('addLink')}
            >
                <LinkIcon className="h-4 w-4" />
            </button>
            <div className="mx-1 h-4 w-px bg-border" />
            <button
                type="button"
                onClick={() => editor.chain().focus().undo().run()}
                className="rounded-md p-1.5 text-foreground-muted transition-colors hover:bg-surface"
                title={t('undo')}
            >
                <Undo className="h-4 w-4" />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().redo().run()}
                className="rounded-md p-1.5 text-foreground-muted transition-colors hover:bg-surface"
                title={t('redo')}
            >
                <Redo className="h-4 w-4" />
            </button>
        </div>
    );
};

export default function RichTextEditor({ value, onChange, placeholder }: Props) {
    const t = useTranslations('richText');
    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [3],
                },
            }),
            Underline,
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-primary underline underline-offset-4 cursor-pointer',
                },
            }),
            Placeholder.configure({
                placeholder: placeholder || t('placeholder'),
            }),
        ],
        content: value,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
    });

    return (
        <div className="w-full overflow-hidden rounded-xl border border-border bg-surface focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20 transition-all">
            <MenuBar editor={editor} />
            <EditorContent
                editor={editor}
                className="prose prose-sm prose-invert max-w-none p-4 min-h-[150px] outline-none"
            />
            <style jsx global>{`
                .tiptap p.is-editor-empty:first-child::before {
                    color: var(--foreground-muted);
                    content: attr(data-placeholder);
                    float: left;
                    height: 0;
                    pointer-events: none;
                }
                .tiptap:focus {
                    outline: none;
                }
            `}</style>
        </div>
    );
}
