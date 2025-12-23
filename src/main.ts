import * as monaco from "monaco-editor";
import EmbedPDF from "@embedpdf/snippet";
import { MarkdownRenderer } from "pdfkit-markdown";
import remarkParse from "remark-parse";
import { unified } from "unified";
import PDFDocument from "pdfkit/js/pdfkit.standalone";
import BlobStream from "./writeable";

function mdToPDF(md: string): Promise<Blob> {
    return new Promise((resolve, reject) => {
        try {
            const tree = unified()
                .use(remarkParse)
                .parse(md);
            const doc = new PDFDocument();
            const stream = new BlobStream();
            stream.addEventListener("finish", () => {
                resolve(stream.blob());
            });
            doc.pipe(stream);
            new MarkdownRenderer(doc, { /* optional settings */ }).render(tree);
            doc.end();
            console.log("Reached document end")
        } catch (e) {
            alert(e);
            reject();
        }
    }
    )


}

const editor = monaco.editor.create(document.getElementById("editor"), {
        value: "",
        language: "markdown"
});

const pdfViewer = EmbedPDF.init({
        type: 'container',
        target: document.getElementById("render"),
});

const viewerRegistry = await pdfViewer?.registry;

const manager = viewerRegistry?.getPlugin("document-manager")?.provides();

function main() {

    if (!pdfViewer || !viewerRegistry || !manager) {
        return;
    }

    let changeTimeout: number | undefined;
    let bloblink: string | undefined;

    function render() {
        const md = editor.getValue();
        mdToPDF(md).then(blob => blob.arrayBuffer()).then(buf => {
            if (pdfViewer) {
                manager.closeAllDocuments();
                manager.openDocumentBuffer({
                    buffer: buf,
                    name: "",
                    autoActivate: true
                })
            } else {
                throw new Error("PDF Viewer not found");
            }
        })

        return
    }

    editor.getModel()?.onDidChangeContent(e => {
        clearTimeout(changeTimeout);
        console.log(e);
        changeTimeout = setTimeout(render, 200);
    });
}

main();

