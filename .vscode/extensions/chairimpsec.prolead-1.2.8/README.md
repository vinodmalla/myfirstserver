# PROLEAD Extension

Contents: [Introduction](#introduction) - [Functions](#functions) - [Structure](#project-structure) - [Contact](#contact-and-support)

## Introduction
PROLEAD allows to analyze the robust probing security of masked implementations provided as a verilog netlist or arm binary.\
The tool PROLEAD is command-line-based, here comes this extension in and provides a gui to clone/update PROLEAD source code, build it, configure the settings or choose standard values, run PROLEAD and evaluate the output with useful warnings, error messages and updates in the status bar that guide the user.

#### Walkthrough

Please check the walkthrough to know how you should install what is needed and set up the extension .\
To open the walkthrough, open the command bar (`ctrl`+`shift`+`p`), type `open walkthrough`, and choose `PROLEAD`.

#### Extension Settings

Please check the extension settings to specify settings like code path, templates, hide commands icons etc.\
To go to the extension settings, open VSC Settings (`ctrl`+`,`), click on `Extensions`, then click on `PROLEAD`.

> This extension was developed only for the hardware version of PROLEAD.

## Functions
| Name | Icon | Shortcut | Description |
|------|------|----------|-------------|
|Create Project|<img src="https://raw.githubusercontent.com/rami-alkhooli/TestRepo/main/pjct-D.png" width="16px" height="16px">|`ctrl`+`alt`+`p`|lets you create a new project by setting its path and choosing its components|
|Edit Library|<img src="https://raw.githubusercontent.com/rami-alkhooli/TestRepo/main/libr-D.png" width="16px" height="16px">|`ctrl`+`alt`+`e`|lets you edit and create any cell of any library (a gui for library.lib)|
|Configure|<img src="https://raw.githubusercontent.com/rami-alkhooli/TestRepo/main/cfgr-D.png" width="16px" height="16px">|`ctrl`+`alt`+`c`|opens the configuration page (a gui for args.set and config.set)|
|Get Ready|<img src="https://raw.githubusercontent.com/rami-alkhooli/TestRepo/main/prpr-D.png" width="16px" height="16px">|`ctrl`+`alt`+`s`|checks up for code updates, the needed files, executables and gets the updates|
|Evaluate|<img src="https://raw.githubusercontent.com/rami-alkhooli/TestRepo/main/evlt-D.png" width="16px" height="16px">|`ctrl`+`alt`+`f5`|runs PROLEAD with the provided parameters in args.set and settings in config.set|

> You can find the icons in the top right corner and in the status bar in the left bottom corner.

## Project Structure

#### Directory Tree

```bash
.
├─ args.set
├─ config.set
├─ gate/
│  └─ design.v
├─ library.lib
└─ results/
```

#### Folders and Files

| Name | Description |
|---|---|
| **args.set** | contains the parameters that are passed to PROLEAD via command line. |
| **config.set** | contains the settings of PROLEAD which are needed for the simulation, evaluation and performance |
| **design.v** | contains the gate-level netlist of the implementaion you want to test, written in verilog |
| **library.lib** | contains the library that define the functional behavior of each cell in the netlist |
| **results/** | saves the output of PROLEAD after each evaluation in a new folder with the name format `DD-MM-YYYY_hh-mm-ss` |

#### Templates

When creating a new project you can choose to select an existing library file (for example) or use the standard library from the template.\
You can find these templates in the extension folder under `~/.vscode/extensions/prolead`

> To open an existing project, simply open the folder, in which it is contained.

## Contact and Support

For a more detailed information about PROLEAD, its parameters and its settings please visit the [Wiki page](https://github.com/ChairImpSec/PROLEAD/wiki) on Github.

Please contact Nicolai Müller ([nicolai.mueller@rub.de](mailto:nicolai.mueller@rub.de)) if you have any questions, comments, if you found a bug that should be corrected, or if you want to reuse PROLEAD or parts of it for your own research projects.
