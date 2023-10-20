import { useState } from "react";
import { message, open } from "@tauri-apps/api/dialog";
import { Command } from "@tauri-apps/api/shell";
import { useNavigate } from "react-router-dom";
import Hyperlink from "../components/hyperlink";
import EllipsisLoader from "../components/ellipsis-loader";

interface RosterInstallerState {
  installDir: string | undefined,
  rosterArchiveFile: string | undefined,
  menuFacesArchiveFile: string | undefined,
  inGameFacesArchiveFile: string | undefined,
  cyberFacesArchiveFile: string | undefined,
  arenaArchiveFile: string | undefined,
  jerseysArchiveFile: string | undefined,
  masksArchiveFile : string | undefined,
  pbpArchiveFile: string | undefined,
  goalHornsArchiveFile: string | undefined,
  showConsole: boolean,
  status: 'install' | 'installing' | 'complete' | 'error';
  scriptStdOutAndErr: string,
  latestStdOutOrErr: string,
}
function RosterInstaller() {
  const navigate = useNavigate();
  const [rosterInstallerState, reactSetRosterInstallerState] = useState<RosterInstallerState>({
    installDir: undefined,
    rosterArchiveFile: undefined,
    menuFacesArchiveFile: undefined,
    inGameFacesArchiveFile: undefined,
    cyberFacesArchiveFile: undefined,
    arenaArchiveFile: undefined,
    jerseysArchiveFile: undefined,
    masksArchiveFile: undefined,
    pbpArchiveFile: undefined,
    goalHornsArchiveFile: undefined,
    showConsole: false,
    status: 'install',
    scriptStdOutAndErr: '',
    latestStdOutOrErr: '',
  })
  const {
    installDir,
    rosterArchiveFile,
    menuFacesArchiveFile,
    inGameFacesArchiveFile,
    cyberFacesArchiveFile,
    arenaArchiveFile,
    jerseysArchiveFile,
    masksArchiveFile,
    pbpArchiveFile,
    goalHornsArchiveFile,
    showConsole,
    status,
    scriptStdOutAndErr,
    latestStdOutOrErr,
  } = rosterInstallerState;
  
  const setRosterInstallerState = (newRosterInstallerState: Partial<RosterInstallerState>) => {
    reactSetRosterInstallerState(prevRosterInstallerState => ({
      ...prevRosterInstallerState,
      ...newRosterInstallerState,
    }))
  }

  const runCommandAndAppendToConsole = async (command: Command, throwOnErrorCode: boolean = true) => {
    command.stdout.on('data', (data) => {
      console.log(data);
      reactSetRosterInstallerState(prevRosterInstallerState => ({
        ...prevRosterInstallerState,
        scriptStdOutAndErr: `${prevRosterInstallerState.scriptStdOutAndErr}${data}`,
        latestStdOutOrErr: data,
      }));
    })
    command.stderr.on('data', (data) => {
      console.error(data);
      reactSetRosterInstallerState(prevRosterInstallerState => ({
        ...prevRosterInstallerState,
        scriptStdOutAndErr: `${prevRosterInstallerState.scriptStdOutAndErr}${data}`,
        latestStdOutOrErr: data,
      }));
    })
    const commandResult = await command.execute();
    if (commandResult.code !== 0 && throwOnErrorCode) {
      throw new Error(`Command failed.\nLast message: ${latestStdOutOrErr}\nExit code: ${commandResult.code}`);
    }
    return commandResult;
  }

  const openInstallDirectory = async () => {
    const installDir = await open({directory: true});
    if (installDir === null || Array.isArray(installDir)) return;
    const nhlVerifyInstallCommand = Command.sidecar('.sidecar/nhl-04-verify-install', [
      installDir,
    ])
    if ((await runCommandAndAppendToConsole(nhlVerifyInstallCommand, false)).code !== 0) return await message(
      'No NHL 04 installation found to patch. Directory must contain the "NHL 04 Rebuilt.sh" executable.',
      {
        title: 'No NHL 04 installation found', 
        type: 'error'
      },
    );
    setRosterInstallerState({
      installDir
    });
  }

  const openRosterArchiveFile = async () => {
    const rosterArchiveFile = await open();
    if (rosterArchiveFile === null || Array.isArray(rosterArchiveFile)) return;
    setRosterInstallerState({
      rosterArchiveFile
    });
  }

  const openMenuFacesArchiveFile = async () => {
    const menuFacesArchiveFile = await open();
    if (menuFacesArchiveFile === null || Array.isArray(menuFacesArchiveFile)) return;
    setRosterInstallerState({
      menuFacesArchiveFile
    });
  }

  const openInGameFacesArchiveFile = async () => {
    const inGameFacesArchiveFile = await open();
    if (inGameFacesArchiveFile === null || Array.isArray(inGameFacesArchiveFile)) return;
    setRosterInstallerState({
      inGameFacesArchiveFile
    });
  }

  const openCyberFacesArchiveFile = async () => {
    const cyberFacesArchiveFile = await open();
    if (cyberFacesArchiveFile === null || Array.isArray(cyberFacesArchiveFile)) return;
    setRosterInstallerState({
      cyberFacesArchiveFile
    });
  }

  const openArenaArchiveFile = async () => {
    const arenaArchiveFile = await open();
    if (arenaArchiveFile === null || Array.isArray(arenaArchiveFile)) return;
    setRosterInstallerState({
      arenaArchiveFile
    });
  }

  const openJerseysArchiveFile = async () => {
    const jerseysArchiveFile = await open();
    if (jerseysArchiveFile === null || Array.isArray(jerseysArchiveFile)) return;
    setRosterInstallerState({
      jerseysArchiveFile
    });
  }

  const openMasksArchiveFile = async () => {
    const masksArchiveFile = await open();
    if (masksArchiveFile === null || Array.isArray(masksArchiveFile)) return;
    setRosterInstallerState({
      masksArchiveFile
    });
  }


  const openPbpArchiveFile = async () => {
    const pbpArchiveFile = await open();
    if (pbpArchiveFile === null || Array.isArray(pbpArchiveFile)) return;
    setRosterInstallerState({
      pbpArchiveFile
    });
  }

  const openGoalHornsArchiveFile = async () => {
    const goalHornsArchiveFile = await open();
    if (goalHornsArchiveFile === null || Array.isArray(goalHornsArchiveFile)) return;
    setRosterInstallerState({
      goalHornsArchiveFile
    });
  }

  const extractAndInstallArchive = async (archive: string) => {
    const extractAndInstallArchiveCommand = Command.sidecar('.sidecar/7-Zip.AppImage', [
      'x',
      archive,
      `-o${installDir}/prefix/drive_c/Program Files/EA SPORTS/NHL 2004/`,
      '-aoa',
    ]);
    return await runCommandAndAppendToConsole(extractAndInstallArchiveCommand);
  }
  
  const install = async () => {
    if (installDir === undefined) return await message(
      'No NHL 04 installation selected',
      {
        title: 'No NHL 04 installation found', 
        type: 'error'
      },
    ); 

    if (rosterArchiveFile === undefined
      || menuFacesArchiveFile === undefined
      || inGameFacesArchiveFile === undefined
      || cyberFacesArchiveFile === undefined
      || arenaArchiveFile === undefined
      || jerseysArchiveFile === undefined
      || masksArchiveFile === undefined
      || pbpArchiveFile === undefined
      || goalHornsArchiveFile === undefined
    ) return await message(
      'One or more archives needs to be selected.',
      {
        title: 'Archive selection needed', 
        type: 'error'
      },
    );
    setRosterInstallerState({status: 'installing'});
    try {  
      await extractAndInstallArchive(menuFacesArchiveFile);
      await extractAndInstallArchive(inGameFacesArchiveFile);
      await extractAndInstallArchive(arenaArchiveFile);
      await extractAndInstallArchive(jerseysArchiveFile);
      await extractAndInstallArchive(masksArchiveFile);
      await extractAndInstallArchive(goalHornsArchiveFile);

      const rosterExtractCommand = Command.sidecar('.sidecar/7-Zip.AppImage', [
        'x',
        rosterArchiveFile,
        `-o${installDir}/roster`,
        '-aoa'
      ]);
      await runCommandAndAppendToConsole(rosterExtractCommand);

      const cyberFacesExtractCommand = Command.sidecar('.sidecar/7-Zip.AppImage', [
        'x',
        cyberFacesArchiveFile,
        `-o${installDir}/gamedata`,
        '-aoa'
      ]);
      await runCommandAndAppendToConsole(cyberFacesExtractCommand);


      const pbpExtractCommand = Command.sidecar('.sidecar/7-Zip.AppImage', [
        'x',
        pbpArchiveFile,
        `-o${installDir}/pbp`,
        '-aoa'
      ]);
      await runCommandAndAppendToConsole(pbpExtractCommand);
      
  
      const rosterInstallCommand = Command.sidecar('.sidecar/nhl-04-roster-install', [
        installDir
      ]);
      await runCommandAndAppendToConsole(rosterInstallCommand);
      setRosterInstallerState({status: 'complete'});
      await message(
        'Roster installation complete.',
        {
          title: 'Roster installation complete', 
          type: 'info',
        },
      );
    }
    catch (e) {
      setRosterInstallerState({
        status: 'error',
      })
      await message(
        `Installation failed:\n${e}`,
        {
          title: 'Installation failed', 
          type: 'error'
        },
      )
    }
  } 


  return (
    <div className="container">
      <h1>NHL 04 Roster Installer</h1>
      {(status === 'install' || status === 'complete' || status === 'error') &&
        <button role="link" onClick={() => navigate('/')}>Back</button>
      }
      <div className="show-console-checkbox-container">
        <input 
          type="checkbox"
          checked={showConsole} name="show-console"
          onChange={(e) => setRosterInstallerState({showConsole: e.target.checked})}
        />
        <label htmlFor="show-console">Show console</label>
      </div>
      {showConsole &&
        <div className="console">
          <pre>{scriptStdOutAndErr}</pre>
        </div>
      }
      {status === 'install' &&
        <>
          <p>
            Install a roster to your NHL 2004 on Linux instance.
            You will need links under the <Hyperlink 
              href="https://www.tapatalk.com/groups/nhl04rebuilt/nhl04-rebuilt-2023-2024-links-installation-info-t13.html"
            >  
              <i>"Main Downloads"</i> section of this page
            </Hyperlink>
            . This will overwrite files in your installation.
          </p>
          <p>
            Select your NHL 2004 install directory.
            Where the <i>"NHL 04 Rebuilt.sh"</i> executable is located.
          </p>
          <p>
            <button onClick={openInstallDirectory}>Install Directory</button> {installDir || 'Not selected'}
          </p>
          <p>
            Select a roster archive downloaded from either steps 2 or 2a. 2a uses more "realistic" attributes.
          </p>
          <p>
            <button onClick={openRosterArchiveFile}>Rosters.rar</button> {rosterArchiveFile || 'Not selected'}
          </p>
          <p>
            Select the menufaces archive downloaded from step 3a.
          </p>
          <p>
            <button onClick={openMenuFacesArchiveFile}>Menufaces.rar</button> {menuFacesArchiveFile || 'Not selected'}
          </p>
          <p>
            Select the in-game faces archive downloaded from step 3b.
          </p>
          <p>
            <button onClick={openInGameFacesArchiveFile}>gamedata.rar</button> {inGameFacesArchiveFile || 'Not selected'}
          </p>
          <p>
            Select the cyberfaces archive downloaded from step 4.
          </p>
          <p>
            <button onClick={openCyberFacesArchiveFile}>face2004-jedeash.rar</button> {cyberFacesArchiveFile || 'Not selected'}
          </p>
          <p>
            Select the arena archive from downloaded step 5.
          </p>
          <p>
            <button onClick={openArenaArchiveFile}>Arenas.rar</button> {arenaArchiveFile || 'Not selected'}
          </p>
          <p>
            Select the jerseys archive downloaded from step 7.
          </p>
          <p>
            <button onClick={openJerseysArchiveFile}>jerseys.rar</button> {jerseysArchiveFile || 'Not selected'}
          </p>
          <p>
            Select the masks archive downloaded from step 8.
          </p>
          <p>
            <button onClick={openMasksArchiveFile}>masks.rar</button> {masksArchiveFile || 'Not selected'}
          </p>
          <p>
            Select the commentary/play-by-play archive downloaded from step 9.
          </p>
          <p>
            <button onClick={openPbpArchiveFile}>pbp.7z</button> {pbpArchiveFile || 'Not selected'}
          </p>
          <p>
            Select the goal horns archive downloaded from step 10.
            The mirror link is more straightforward to download.
          </p>
          <p>
            <button onClick={openGoalHornsArchiveFile}>required.rar</button> {goalHornsArchiveFile || 'Not selected'}
          </p>
          <p>
            <button onClick={install}>Install</button>
          </p>
        </>
      }
      {status === 'installing' &&
        <>
          <p>
            The archives are currently being extracted and installed.
          </p>
        </>
      }
      {status === 'complete' &&
        <>
          <p>
            Roster installation complete.
          </p>
        </>
      }
      {status === 'error' &&
        <>
          <p>
            An error occured during installation.
            Check "<i>Show console</i>" on the top right to view the console for additional information.
          </p>
        </>
      }
      {(status === 'installing' || status === 'error') &&
        <div className="latest-console-out">
          <span>{latestStdOutOrErr}</span>
          <EllipsisLoader />
        </div>
      }
    </div>
  );
}

export default RosterInstaller;