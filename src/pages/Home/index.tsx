import { useCallback, useState } from "react";
import "./styles.scss";
import { HierarchyNode } from "../../types";
import { FiPlus, FiTrash2 } from "react-icons/fi";

export function Home() {
  const [node, setNode] = useState<HierarchyNode>({ name: "" });

  const changeValue = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>, path: number[]) => {
      const updatedNode = { ...node };
      let current = updatedNode;

      for (let i = 0; i < path.length; i++) {
        current = current.children![path[i]];
      }

      current.name = e.target.value;
      setNode(updatedNode);
    },
    [node]
  );

  const addNode = useCallback(
    (path: number[]) => {
      const updatedNode = { ...node };
      let current = updatedNode;

      for (let i = 0; i < path.length; i++) {
        current = current.children![path[i]];
      }

      current.children = [...(current.children || []), { name: "" }];
      setNode(updatedNode);
    },
    [node]
  );

  const removeNode = useCallback(
    (path: number[]) => {
      const updatedNode = { ...node };
      let current = updatedNode;
      let parent = null;

      for (let i = 0; i < path.length; i++) {
        parent = current;
        current = current.children![path[i]];
      }

      if (parent && parent.children) {
        parent.children = parent.children.filter(
          (_, index) => index !== path[path.length - 1]
        );
      }

      setNode(updatedNode);
    },
    [node]
  );

  const renderNode = useCallback(
    (currentNode: HierarchyNode, level = 0, path: number[] = []) => {
      return (
        <div className="node" key={path.join("-")}>
          <label
            className="node__wrapper"
            style={{ paddingLeft: level ? 12 : 0 }}
          >
            Name:
            <div className="node__content">
              <input
                className="node__input"
                type="text"
                value={currentNode.name}
                onChange={(e) => changeValue(e, path)}
              />

              <button
                className="button button--square"
                type="button"
                onClick={() => addNode(path)}
                title="Add Child"
                disabled={!currentNode.name}
              >
                <FiPlus />
              </button>

              {level > 0 && (
                <button
                  className="button button--square"
                  type="button"
                  onClick={() => removeNode(path)}
                  title="Remove Node"
                >
                  <FiTrash2 />
                </button>
              )}
            </div>
          </label>

          {currentNode.children && currentNode.children.length > 0 && (
            <div
              className="node__container node__children"
              style={{ marginLeft: level ? level + 32 : 0 }}
            >
              {currentNode.children.map((child, index) =>
                renderNode(child, level + 1, [...path, index])
              )}
            </div>
          )}
        </div>
      );
    },
    [addNode, changeValue, removeNode]
  );

  const filterNodes = useCallback(
    (currentNode: HierarchyNode): HierarchyNode | null => {
      if (!currentNode.name) return null;

      if (currentNode.children) {
        const filteredChildren = currentNode.children
          .map(filterNodes)
          .filter((child): child is HierarchyNode => child !== null);

        return { ...currentNode, children: filteredChildren };
      }

      return currentNode;
    },
    []
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      const jsonString = JSON.stringify(filterNodes(node), null, 2);

      const blob = new Blob([jsonString], { type: "application/json" });

      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "hierarchy.json";
      a.click();

      URL.revokeObjectURL(url);
    },
    [filterNodes, node]
  );

  return (
    <div className="container">
      <h1 className="container__title">Words Hierarchy Builder</h1>

      <form className="container__form" onSubmit={handleSubmit}>
        {renderNode(node)}

        <div className="container__form__submit">
          <button className="button button--submit" type="submit">
            Save
          </button>
        </div>
      </form>
    </div>
  );
}
