I want to make a tex-editor or a tex editor extension that automatically converts typed rough draft of notes into compilable and polishable tex code live in real time, kind of like cursor's tab feature except it triggers automatically when the user presses say for instance, three enters in a row.

The process would look as follows:

for the document, you will have two sections:

Already formatted latex code + rough draft section

the user types in rough drafts, and that would be classified as the rough draft section

when the user presses 3 enters, the rough draft section gets sent to a locally run qwen-3-4b-instruct-no-thinking LLM using LMstudio. The system prompt would be like this:

{
  "identifier": "@local:latex-converter",
  "name": "Latex converter",
  "changed": true,
  "operation": {
    "fields": [
      {
        "key": "llm.prediction.systemPrompt",
        "value": "Convert rough draft text into compilable LaTeX code. Infer the content type (equation, pseudocode, plain text, code block, etc.) and apply the appropriate LaTeX syntax and environments. Formalize rough or incomplete notation into proper LaTeX while preserving all values and meanings—never change numerical values, variable names, or remove elements, even if they appear incorrect. Add minimal formatting only when necessary for readability.\nOutput only the LaTeX content itself—do not include document preamble, \\documentclass, \\usepackage, \\begin{document}, or \\end{document} tags. Provide only the code that would appear in the document body."
      }
    ]
  },
  "load": {
    "fields": []
  }
}

Then we take the model output and replace the rough draft section in the editor.

One thing to make sure is that to record what parts are exactly the rough draft during the llm call, because that takes time, and in that time the user might be working on another part already. we need to make sure to not overwrite that part.

The extension would save a live working tex file each time the conversion is triggered, which is basically the whole thing without the rough draft text.

What libraries, languages, and frameworks should I use?