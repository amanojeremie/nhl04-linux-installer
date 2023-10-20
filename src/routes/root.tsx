import { Link } from "react-router-dom";

function Root() {
  return (
    <div className="container">
      <h1>NHL 04 Installer</h1>
      <ul>
        <li><Link to="/installer">Install NHL 2004</Link></li>
        <li><Link to="/post-install-guide">Post-install guide</Link></li>
        <li><Link to="/roster-installer">Install roster files to an existing NHL 2004 installation</Link></li>
        <li><Link to="/licenses">Open source software licenses</Link></li>
      </ul>
    </div>
  )
}
export default Root;