import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export default function Portal({ children }) {
  const [mounted, setMounted] = useState(false);
  const [portalNode, setPortalNode] = useState(null);

  useEffect(() => {
    setMounted(true);
    // Create a div element for the portal
    const node = document.createElement('div');
    document.body.appendChild(node);
    setPortalNode(node);

    // Cleanup function to remove the portal when component unmounts
    return () => {
      document.body.removeChild(node);
    };
  }, []);

  if (!mounted || !portalNode) {
    return null;
  }

  return createPortal(children, portalNode);
}
