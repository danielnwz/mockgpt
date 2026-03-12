import conceptsHtml from '../../chat-input-concepts.html?raw';

export function ChatInputConceptsPage() {
  return (
    <div className="h-full w-full bg-background">
      <iframe
        title="Chat Input Concepts"
        srcDoc={conceptsHtml}
        className="h-full w-full border-0"
      />
    </div>
  );
}

