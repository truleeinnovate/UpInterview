import Tabs from './Tabs';
import Editor from './Editor';
import Whiteboard from './Whiteboard';

const CodeEditor = () => {
  const tabs = [
    {
      label: 'Code Editor',
      content: <Editor />
    },
    {
      label: 'Whiteboard',
      content: <Whiteboard />
    }
  ];

  return (
    <div className="w-full h-screen">
      <Tabs tabs={tabs} />
    </div>
  );
}

export default CodeEditor;
