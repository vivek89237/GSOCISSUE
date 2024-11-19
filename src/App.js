import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import { collection, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, query, orderBy, onSnapshot } from "firebase/firestore"; // Include updateDoc for updating issues
import "./App.css";

const App = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("Open");
  const [githubLink, setGithubLink] = useState(""); // GitHub link field
  const [issueId, setIssueId] = useState(null); // To track if we're editing an issue

  // Function to handle form submission (create or update issue)
  const submitIssue = async (e) => {
    e.preventDefault();

    if (title && description) {
      if (issueId) {
        // Update existing issue
        try {
          const issueRef = doc(db, "issues", issueId);
          await updateDoc(issueRef, {
            title: title,
            description: description,
            status: status,
            githubLink: githubLink, // Update GitHub link as well
          });
          alert("Issue updated successfully!");
          clearForm();
        } catch (error) {
          console.error("Error updating issue: ", error);
        }
      } else {
        // Add new issue
        try {
          await addDoc(collection(db, "issues"), {
            title: title,
            description: description,
            status: status,
            githubLink: githubLink,
            created_at: serverTimestamp(), // Use serverTimestamp from the Firestore module
          });
          alert("Issue added successfully!");
          clearForm();
        } catch (error) {
          console.error("Error adding issue: ", error);
        }
      }
    } else {
      alert("Please fill in all fields.");
    }
  };

  // Function to clear the form after submission or update
  const clearForm = () => {
    setTitle("");
    setDescription("");
    setStatus("Open");
    setGithubLink("");
    setIssueId(null);
  };

  // Function to handle editing an issue
  const handleEdit = (issue) => {
    setTitle(issue.title);
    setDescription(issue.description);
    setStatus(issue.status);
    setGithubLink(issue.githubLink || "");
    setIssueId(issue.id); // Set the issue ID so we know we're editing
  };

  return (
    <div className="App">
      <h1>GitHub Issue Tracker</h1>
      <IssueForm
        title={title}
        setTitle={setTitle}
        description={description}
        setDescription={setDescription}
        status={status}
        setStatus={setStatus}
        githubLink={githubLink}
        setGithubLink={setGithubLink}
        issueId={issueId}
        submitIssue={submitIssue}
        clearForm={clearForm}
      />
      <h2>Issue List</h2>
      <IssueList handleEdit={handleEdit} />
    </div>
  );
};

// IssueForm Component for submitting or editing issues
const IssueForm = ({
  title,
  setTitle,
  description,
  setDescription,
  status,
  setStatus,
  githubLink,
  setGithubLink,
  issueId,
  submitIssue,
  clearForm,
}) => {
  return (
    <form className="issue-form" onSubmit={submitIssue}>
      <input
        type="text"
        placeholder="Issue Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <textarea
        placeholder="Issue Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
      />
      <select value={status} onChange={(e) => setStatus(e.target.value)}>
        <option value="Open">Open</option>
        <option value="In Progress">In Progress</option>
        <option value="Closed">Closed</option>
      </select>
      <input
        type="url"
        placeholder="GitHub Link (optional)"
        value={githubLink}
        onChange={(e) => setGithubLink(e.target.value)}
      />
      <button type="submit">{issueId ? "Update Issue" : "Submit Issue"}</button>
      {issueId && <button type="button" onClick={clearForm}>Cancel Edit</button>}
    </form>
  );
};

// IssueList Component for displaying, editing, and deleting issues
const IssueList = ({ handleEdit }) => {
  const [issues, setIssues] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "issues"), orderBy("created_at", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const issuesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setIssues(issuesData);
    });

    return () => unsubscribe();
  }, []);

  // Function to delete an issue
  const deleteIssue = async (id) => {
    try {
      await deleteDoc(doc(db, "issues", id));
      alert("Issue deleted successfully!");
    } catch (error) {
      console.error("Error deleting issue: ", error);
    }
  };

  return (
    <div id="issueList">
      {issues.map((issue) => (
        <div key={issue.id} className="issue">
          <h3>{issue.title}</h3>
          <p>{issue.description}</p>
          <span className={`issue-status ${issue.status.replace(/\s+/g, '')}`}>
            {issue.status}
          </span>
          {issue.githubLink && (
            <p>
              <a href={issue.githubLink} target="_blank" rel="noopener noreferrer">
                GitHub Link
              </a>
            </p>
          )}
          {/* Edit and Delete icons */}
          <i 
            className="fas fa-edit edit-icon"
            onClick={() => handleEdit(issue)} // Pass issue to handleEdit
            title="Edit Issue"
          ></i>
          <i 
            className="fas fa-trash-alt delete-icon"
            onClick={() => deleteIssue(issue.id)} // Delete the issue
            title="Delete Issue"
          ></i>
        </div>
      ))}
    </div>
  );
};

export default App;
