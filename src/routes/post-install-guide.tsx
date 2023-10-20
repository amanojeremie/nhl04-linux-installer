import { Link, useNavigate } from "react-router-dom";
import Hyperlink from "../components/hyperlink";

function PostInstallGuide() {
  const navigate = useNavigate();
  return (
    <div className="container">
      <h1>Post-install guide</h1>
      <button role="link" onClick={() => navigate('/')}>Back</button>
      <p>
        If your installation is complete,
        here are some additional points and information about NHL 2004 on Linux.
      </p>
      <h2>Additional setup and configuration</h2>
      <p>
        The installer creates 2 symlinks to important directories in your installlation
        <ul>
          <li>
            <i>NHL 2004 Documents Directory</i> links
            to a directory where rosters and saves are stored.
          </li>
          <li>
            <i>NHL 2004 Program Directory</i> links
            to the NHL 2004 executable directory. 
            Mods are usually installed in this directory.
            <ul>
              <li>
                You can streamline roster installation by using the 
                built-in <Link to="/roster-installer">roster installer.</Link>
              </li>
            </ul>
          </li>
        </ul>
      </p>
      <p>
        This project wouldn't be possible without 
        the <Hyperlink href="https://www.tapatalk.com/groups/nhl04rebuilt/nhl04-rebuilt-2023-2024-links-installation-info-t13.html">NHL04 Rebuilt project.</Hyperlink> Check
        out the page for additional information on the project.
      </p>
      <p>
        Check out <Hyperlink href="https://www.tapatalk.com/groups/nhl04rebuilt/drgullen-s-tweaks-v3-t6260.html"><i>Drgullen's in game tweaks</i></Hyperlink> mod
        for a gameplay and physics revamp. This project was tested using the v2 version of this mod through an 82-game season & playoffs.
        The v2 version of the mod can be installed under the <i>Get Mods</i> tab of in <i>Mods</i> section the NHL04 Rebuilt launcher.
        V3 requires additional steps as detailed in the linked page.
      </p>
      <p>
        Gamepad support is provided by <Hyperlink href="https://github.com/samuelgr/Xidi">Xidi</Hyperlink>.
        Providing analog joystick support and button mapping for <i>Steam Input</i> compatible controllers. 
        Controllers will have to be manually configured in the NHL 2004 application.
      </p>
      <h2>Notes for Steam Deck users</h2>
      <p>
        NHL 2004 is dated with regards to menu user experience. 
        You will have to use the trackpad to navigate the menu as there is no controller support. 
        Once in game, controllers will work. 
        Use the <i>"Gamepad with Mouse Trackpad"</i> layout for the best experience.
      </p>
      <p>
        Add <i>"NHL 04 Rebuilt.sh"</i> as a non-steam game to be able to play in Gaming Mode.
      </p>
      <h2>Wine issues</h2>
      <p>
        Although most of the game works once installation is complete,
        there are some minor quirks with how Wine runs NHL 2004.
        Keep the following points in mind.
      </p>
      <ul>
        <li>
          Use "Full Screen Window" instead of "Full Screen Exclusive" in the Launcher settings.
          <ul>
            <li>
              Fullscreen exclusive shifts the main menu from the actual interactable area
            </li>
          </ul>
        </li>
        <li>
          While configuring controllers, the unbound controls have a smaller clickable area when rebinding.
        </li>
        <li>
          Restart the NHL 2004 app after each game.
          <ul>
            <li>
              An audio issue presents when a game ends,
              quickly restarting is the only resolution at the moment.
            </li>
          </ul>
        </li>
      </ul>
    </div>
  )
}
export default PostInstallGuide;