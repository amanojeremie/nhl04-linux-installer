import { useState } from "react";
import { message, open } from "@tauri-apps/api/dialog";
import { Command } from "@tauri-apps/api/shell";
import { internetExplorerInstaller, nhlInstallerCodeEntry, nhlInstallerFlashPrompt, nhlInstallerInsertCdRom, nhlInstallerInstalling, nhlInstallerLanguageSelect, nhlInstallerOnlineService, nhlInstallerProductRegistration, nhlInstallerUserType } from "../utils/nhl-installer-assets";
import { Link, useNavigate } from "react-router-dom";
import { readDir } from "@tauri-apps/api/fs";
import Hyperlink from "../components/hyperlink";
import EllipsisLoader from "../components/ellipsis-loader";

interface InstallerState {
  installDir: string | undefined,
  disc1File: string | undefined,
  disc2File: string | undefined,
  nhlInterfaceArchiveFile: string | undefined,
  showConsole: boolean,
  status: 'prereq' | 'install' | 'installing' | 'patching' | 'complete' | 'error',
  scriptStdOutAndErr: string,
  latestStdOutOrErr: '',
}
function Installer() {
  const navigate = useNavigate();
  const [installerState, reactSetInstallerState] = useState<InstallerState>({
    installDir: undefined,
    disc1File: undefined,
    disc2File: undefined,
    nhlInterfaceArchiveFile: undefined,
    showConsole: false,
    status: 'prereq',
    scriptStdOutAndErr: '',
    latestStdOutOrErr: '',
  });
  const {
    installDir,
    disc1File,
    disc2File,
    nhlInterfaceArchiveFile,
    showConsole,
    status, 
    scriptStdOutAndErr,
    latestStdOutOrErr,
  } = installerState;


  const setInstallerState = (newinstallerState: Partial<InstallerState>) => {
    reactSetInstallerState(prevInstallerState => ({
      ...prevInstallerState,
      ...newinstallerState,
    }))
  }

  const openInstallDirectory = async () => {
    const installDir = await open({directory: true});
    if (installDir === null || Array.isArray(installDir)) return;
    if((await readDir(installDir)).length > 0) return await message(
      'The installation directory selected is not empty. Please select an empty directory.', 
      {
        title: 'Non-empty directory', 
        type: 'error'
      },
    );
    setInstallerState({
      installDir
    });
  }

  const openDisc1File = async () => {
    const disc1File = await open();
    if (disc1File === null || Array.isArray(disc1File)) return;
    setInstallerState({
      disc1File
    });
  }

  const openDisc2File = async () => {
    const disc2File = await open();
    if (disc2File === null || Array.isArray(disc2File)) return;
    setInstallerState({
      disc2File
    });
  }

  const openNhlInterfaceArchiveFile = async () => {
    const nhlInterfaceArchiveFile = await open();
    if (nhlInterfaceArchiveFile === null || Array.isArray(nhlInterfaceArchiveFile)) return;
    setInstallerState({
      nhlInterfaceArchiveFile
    });
  }


  const runCommandAndAppendToConsole = async (command: Command, throwOnErrorCode: boolean = true) => {
    command.stdout.on('data', (data) => {
      console.log(data);
      reactSetInstallerState(prevInstallerState => ({
        ...prevInstallerState,
        scriptStdOutAndErr: `${prevInstallerState.scriptStdOutAndErr}${data}`,
        latestStdOutOrErr: data,
      }));
    })
    command.stderr.on('data', (data) => {
      console.error(data);
      reactSetInstallerState(prevInstallerState => ({
        ...prevInstallerState,
        scriptStdOutAndErr: `${prevInstallerState.scriptStdOutAndErr}${data}`,
        latestStdOutOrErr: data,
      }));
    })
    const commandResult = await command.execute();
    if (commandResult.code !== 0 && throwOnErrorCode) {
      throw new Error(`Command failed.\nLast message: ${latestStdOutOrErr}\nExit code: ${commandResult.code}`);
    }
    return commandResult;
  }

  async function install() {
    if (status !== 'install') return;
    if (installDir === undefined 
      || disc1File === undefined
      || disc2File === undefined
      || nhlInterfaceArchiveFile === undefined
    ) return await message(
      'A file/directory is missing from the selection.', 
      {
        title: 'Missing file/directory', 
        type: 'error'
      },
    );
    setInstallerState({status: 'installing'})
    try {
      const disc1ExtractCommand = Command.sidecar('.sidecar/7-Zip.AppImage', [
        'x',
        disc1File,
        `-o${installDir}/disc1`,
        '-aoa',
      ]);
      await runCommandAndAppendToConsole(disc1ExtractCommand);
      const disc2ExtractCommand = Command.sidecar('.sidecar/7-Zip.AppImage', [
        'x',
        disc2File,
        `-o${installDir}/disc2`,
        '-aoa',
      ]);
      await runCommandAndAppendToConsole(disc2ExtractCommand);
      const nhlInterfaceExtractCommand = Command.sidecar('.sidecar/7-Zip.AppImage', [
        'x',
        nhlInterfaceArchiveFile,
        `-o${installDir}/interface`,
        '-aoa',
      ]);
      await runCommandAndAppendToConsole(nhlInterfaceExtractCommand);
      const nhlLauncherDownloadCommand = new Command('curl', [
        '-o',
        `${installDir}/launcher.zip`,
        '-L',
        'https://github.com/vod04/launcher/raw/master/launcher.zip'
      ]);
      await runCommandAndAppendToConsole(nhlLauncherDownloadCommand);
      const nhlLauncherExtractCommand = Command.sidecar('.sidecar/7-Zip.AppImage', [
        'x',
        `${installDir}/launcher.zip`,
        `-o${installDir}/launcher`,
        '-aoa',
      ]);
      await runCommandAndAppendToConsole(nhlLauncherExtractCommand);
  
      const xidiDownloadCommand = new Command('curl', [
        '-o',
        `${installDir}/xidi.zip`,
        '-L',
        'https://github.com/samuelgr/Xidi/releases/download/v4.2.0/Xidi-v4.2.0.zip'
      ]);
      await runCommandAndAppendToConsole(xidiDownloadCommand);
      const xidiExtractCommand = Command.sidecar('.sidecar/7-Zip.AppImage', [
        'x',
        `${installDir}/xidi.zip`,
        `-o${installDir}/xidi`,
        '-aoa'
      ]);
      await runCommandAndAppendToConsole(xidiExtractCommand);
  
      const nhlInstallCommand = Command.sidecar('.sidecar/nhl-04-install', [
        installDir,
      ]);
      await runCommandAndAppendToConsole(nhlInstallCommand);
    }
    catch (e) {
      setInstallerState({
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

  async function patch() {
    if (status !== 'installing' || installDir === undefined) return;
    const nhlVerifyInstallCommand = Command.sidecar('.sidecar/nhl-04-verify-install', [
      installDir,
    ])
    if ((await runCommandAndAppendToConsole(nhlVerifyInstallCommand, false)).code !== 0) return await message(
      'No NHL 04 installation found to patch. "Typical User" must be selected during the installer process. The installation may still be in progress.',
      {
        title: 'No NHL 04 installation found', 
        type: 'error'
      },
    );
    setInstallerState({status: 'patching'})
    try {
      const winetricksCommand = Command.sidecar('.sidecar/winetricks', [
        'ie6',
        'dxtrans',
        'urlmon',
        'wsh57'
      ], {
        env: {
          'INSTALLDIR': installDir,
          'WINE': `${installDir}/lutris-GE-Proton8-20-x86_64/bin/wine`,
          'WINEPREFIX': `${installDir}/prefix`
        }
      });
      await runCommandAndAppendToConsole(winetricksCommand);
      const nhlPatchCommand = Command.sidecar('.sidecar/nhl-04-patch', [
        installDir,
      ]);
      await runCommandAndAppendToConsole(nhlPatchCommand);
      setInstallerState({status: 'complete'})
      await message(
        'Installation and patching complete. Launch "NHL 04 Rebuilt.sh" in the install directory.',
        {
          title: 'Installation complete', 
          type: 'info',
        },
      );
    }    
    catch (e) {
      setInstallerState({
        status: 'error',
      })
      await message(
        `Patching failed:\n${e}`,
        {
          title: 'Patching failed', 
          type: 'error'
        },
      )
    }
  }

  return (
    <div className="container">
      <h1>NHL 04 Installer</h1>
      {(status === 'prereq' || status === 'install' || status === 'complete' || status === 'error') &&
        <button role="link" onClick={
          () => {
            if (status === 'prereq' || status === 'complete' || status === 'error') {
              navigate('/');
            }
            else if (status === 'install') {
              setInstallerState({status: 'prereq'});
            }
          } 
        }>
          Back
        </button>
      }
      <div className="show-console-checkbox-container">
        <input 
          type="checkbox"
          checked={showConsole} name="show-console"
          onChange={(e) => setInstallerState({showConsole: e.target.checked})}
        />
        <label htmlFor="show-console">Show console</label>
      </div>
      {showConsole &&
        <div className="console">
          <pre>{scriptStdOutAndErr}</pre>
        </div>
      }
      {status === 'prereq' &&
        <>
          <p>
            Run NHL 2004 on Linux using 
            the <Hyperlink href="https://www.tapatalk.com/groups/nhl04rebuilt/nhl04-rebuilt-2023-2024-links-installation-info-t13.html">NHL 04 Rebuilt project</Hyperlink> and
            Wine.
          </p>
          <h2>Prerequisites</h2>
          <p>
            This installer will setup a new Wine prefix using <Hyperlink href="https://github.com/GloriousEggroll/wine-ge-custom/releases">Wine-GE.</Hyperlink> Wine 
            and Wine-GE have dependencies that can be installed by following <Hyperlink href="https://www.gloriouseggroll.tv/how-to-get-out-of-wine-dependency-hell/">this guide.</Hyperlink> Your
            GPU needs Vulkan support and you need to have <Hyperlink href="https://github.com/lutris/docs/blob/master/InstallingDrivers.md">Vulkan drivers installed.</Hyperlink> Steam
            Deck users on SteamOS will already have these dependencies installed. The installation process will require at least 6GiB of storage, and will download about 1GiB of data. The final installation is 2.4 GiB.
          </p>
          <p>
            You will need NHL 2004 for PC's disc 1 and 2 as .iso files and the 16 digit license associated with your copy. However you get these is up to you. You will also need the&nbsp;
            <Hyperlink href="https://www.tapatalk.com/groups/nhl04rebuilt/2021-nhl-com-interface-t4324.html">
              2021 NHL.com interface
            </Hyperlink>
            &nbsp;which can be can be downloaded <Hyperlink href="https://www.mediafire.com/file/gi2qldpup4lxym8/2021_NHL.com_Interface.rar/file">here</Hyperlink>.
            Once the prerequisites are met, the installation process will take about 10-15 minutes at most, though some manual interactions will be required.
          </p>
          <button onClick={() => setInstallerState({status: 'install'})}>Next</button>
          <h2>What will be downloaded?</h2>
          <p>
            The installer will automatically download the following components necessary to run NHL 2004 on Linux.
          </p>
          <ul>
            <li><Hyperlink href="https://www.tapatalk.com/groups/nhl04rebuilt/04-launcher-v2-download-t5286.html">NHL04 Rebuilt Launcher v2</Hyperlink></li>
            <li><Hyperlink href="https://github.com/GloriousEggroll/wine-ge-custom/releases/tag/GE-Proton8-20">Wine-GE-8-20</Hyperlink> to run NHL 2004 on Linux. (wine or wine-staging will not work)</li>
            <li><Hyperlink href="https://github.com/AlpyneDreams/d8vk/releases/tag/d8vk-v1.0">d8vk v1.0</Hyperlink> DirectX 8 to Vulkan translation layer to render NHL 2004 on Linux.</li>
            <li><Hyperlink href="https://github.com/samuelgr/Xidi/releases/tag/v4.2.0">Xidi v4.2.0</Hyperlink> Xinput to DirectInput wrapper for <i>Steam Input</i> gamepad support.</li>
            <li>Internet Explorer 6 installer required by NHL 2004's main menu.</li>
          </ul>
        </>
      }
      {status === 'install' &&
        <>
          <p>
            Select an install directroy for NHL 2004 on Linux. The directory must be empty.
          </p>
          <p>
            <button onClick={openInstallDirectory}>Install Directory</button> {installDir || 'Not selected'}
          </p>
          <p>Select NHL 2004's disc 1 and disc 2 .iso</p>
          <p>
            <button onClick={openDisc1File}>Disc 1.iso</button> {disc1File || 'Not selected'}
          </p>
          <p>
            <button onClick={openDisc2File}>Disc 2.iso</button> {disc2File || 'Not selected'}
          </p>
          <p>Select the NHL.com 2021 Interface.rar</p>
          <p>
            <button onClick={openNhlInterfaceArchiveFile}>NHL.com 2021 Interface .rar</button> {nhlInterfaceArchiveFile || 'Not selected'}
          </p>
          <button onClick={() => setInstallerState({status: 'prereq'})}>Back</button>
          <button onClick={install}>Install</button>
        </>
      }
      {status === 'installing' &&
        <>
          <p>
            The installation process has begun. Some manual interactions will be required.
          </p>
          <img src={nhlInstallerLanguageSelect} alt="NHL installer's language select" />
          <p>After some time, an installer window will pop up. Select your language then click <i>Next</i>.</p>
          <img src={nhlInstallerCodeEntry} alt="NHL installer's code entry"/>
          <p>Enter the 16 digit code associated with your copy of NHL 2004. Click <i>Next</i> once it's entered.</p>
          <img src={nhlInstallerFlashPrompt} alt="NHL installer's Flash install prompt" />
          <p>Click <i>Yes</i> to install Flash when prompted</p>
          <img src={nhlInstallerUserType} alt="NHL installer's user type select"/>
          <p><i>Typical User</i> must be selected when prompted on type of user. Click <i>Next</i></p>
          <img src={nhlInstallerProductRegistration} alt="NHL installer's product registration" />
          <p>
            Click <i>Register Later</i> when prompted.
          </p>
          <img src={nhlInstallerOnlineService} alt="NHL installer's online service installation prompt." />
          <p>
            Click <i>No</i> when prompted about installing <i>EA Sports online components</i>.
          </p>
          <img src={nhlInstallerInstalling} alt="NHL installer's installing progress bar." />
          <p>
            The installer may take some time to install.
          </p>
          <img src={nhlInstallerInsertCdRom} alt="NHL installer's missing CD-ROM error." />
          <p>
            You will see an error <i>"Cannot locate the CD-ROM"</i>. This is fine. Click <i>OK</i> then click <i>Patch</i>, below.
            Do not click <i>Patch</i> until you receive the <i>"Cannot locate the CD-ROM"</i> error.
          </p>
          <button onClick={patch}>Patch</button>
        </>
      }
      {status === 'patching' &&
        <>
          <p>
            The installation is now being patched to work with Wine.
          </p>
          <img src={internetExplorerInstaller} alt="Screenshot of Internet Explorer 6 installer." />
          <p>Follow through the Internet Explorer 6 installation. Do not click <i>Cancel</i>.</p>
        </>
      }
      {status === 'complete' &&
        <>
          <p>The installation is complete. The <Hyperlink href={installDir || ''} >installation directory</Hyperlink> contains an executable <i>"NHL 04 Rebuilt"</i>.</p>
          <p>
            Follow the <Link to="/post-install-guide">post-install guide</Link> for more information about your NHL 2004 on Linux installation.
            Additionally, <Link to="/roster-installer">install rosters.</Link>
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
      {(status === 'installing' || status === 'patching' || status === 'error') &&
        <div className="latest-console-out">
          <span>{latestStdOutOrErr}</span>
          <EllipsisLoader />
        </div>
      }
    </div>
  );
}

export default Installer;
