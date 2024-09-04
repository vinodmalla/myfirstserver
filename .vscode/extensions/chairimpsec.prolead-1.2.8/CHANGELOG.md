# Change Log

All notable changes to the "prolead" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [1.2.8] - 2023-08-07

- readme file corrected 

## [1.2.7] - 2023-08-07

- Rami is done. Nico takes over. No changes in the tool :D

## [1.2.5] - 2023-06-23

## Added
- Hint on how to open the walkthrough is added to the extension page

## [1.2.4] - 2023-06-23

### Added
- The readme file was forgotten and not uploaded

## [1.2.3] - 2023-06-22

### Added
- Contents overview is added to the extension page at the top
- The icons of the functions are shown correctly in the extension page

## [1.2.2] - 2023-06-21

### Added
- Page scrolls down when a new cell is added when editing libraries

### Fixed
- Bug in running the command get code from walkthrough
- Possible error if the universe repository is not added when installing packages

## [1.2.1] - 2023-06-09

### Added
- PNGs instead of SVG for the walkthrough due to security issues

### Fixed
- Bug in saving empty values for expected output of groups

## [1.2.0] - 2023-06-09

### Added
- Status bar is updated when running the code and info message is shown after evaluation
- Paths are read correctly, even on WSL
- Commands icons are added to the status bar
- Warning message on startup if OS is not linux

### Fixed
- Bug in reading the input and output signals
- Bug in preventing configurations to be saved if an error exists

## [1.1.0] - 2023-05-10

### Added
- The layout of the setting "Number of Initial Clock Cycles" is changed to be interactive
- The setting "Number of Initial Clock Cycles" is treated as states and each state has its own duration of cycles and number of signal/inputs
- For "States of Initial Clock Cycles" one can choose the signals and define their values as bin-values / hex-values or share values
- When switching between bin and hex systems, the values are converted if they are valid, otherwise they are set to 0
- "Probes Include" and "Probes Exclude" have new checkboxes (Glitch Extended, Full Vector) with an explanation for each one on top of the list of wires to include/exclude

## [1.0.16] - 2023-05-01

### Added
- A colored progress bar is shown for the setting "Effect Size" to indicate the effective range of values
- All performance settings are treated as inputs fields and validated
- The settings on the config page are resorted in a new layout
- Two sliders are added for "Number of Step Simulations" and "Number of Step Write Results" that shows the numbers which fullfill the requirements for both settings based on the "Number of Simulations"
- A new setting "Waveform Simulation" is added as a checkbox

### Fixed
- Bug in the validation of "Number of Test Clock Cycles"
- Bug in the validation of "Max Clock Cycle"

## [1.0.14] - 2023-04-24

### Added
- The group size and number of groups updates automatically th group input fields
- the values are converted correctly between bin and hex, and hex values are written in upper case
- random bits are handled correctly when converting

## [1.0.13] - 2023-04-22

### Added
- Values of Clock Signal Name and Always Random Inputs can be edited, validated and saved correctly
- Overlaps between Clock Signal Name and Always Random Inputs are prevented with an error message
- Two options for End Condition are provided: Time/Signal, and for both options the entered value is validated and updated with each change of clock cycles number or output share

## [1.0.12] - 2023-04-19

### Added
- Graphic representation of the cell is shown with each edit. All inputs, outputs and variants are validated
- Output formulas are validated against not-specified inputs or outputs or invalid operators

## [1.0.11] - 2023-04-10

### Added
- Button to scroll to the top when scrolling down
- Drop-down menu for choosing an output to set its formula, menu is updated when editing the outputs

### Features
- For new libraries, creating outputs and adding their formulas then deleting the last output keeps the last formula in memory (if again an other output is added)
- For existing libraries, this feature won't be available -> deleting the last output will delete the last formula from memory

### Known Bugs
- Formulas are sorted descending, so inserting an output before the last output will set the last formula to the newly added output and set an emtpy formula to the current last output
- if inputs or outputs are edited, the formula will not be validated again

## [1.0.10] - 2023-04-09

### Added
- Backups of args, config, design, library, linker file are automatically created on startup (can be used as recovery)
- Cells of selected library are shown correctly (without a graphical representation)
- New library can be created and will be automatically saved to the library file
- The new created library is added automatically to the drop-down-menu
- After creating a new library the edit box will be closed and you can choose from the drop-down-menu
- Cells can be added or deleted for existing libraries or when creating new ones
- The label of the cells will be renumbered when a cell is deleted

### Fixed
- Adding some cells (2) to a new library then closing window to edit an existing library then adding cells to a new library would continue numbering from last time (3)
- Bug in editing cells when other cells are deleted (e.g. editing cell 5 would show changes in cell 3)

### coming soon
- Graphical Representation of the cell and its in-/outputs
- drop-down-menu to edit the formula of the chosen output

## [1.0.9] - 2023-04-02

### Added
- Now config, design, library and linker files can be also browsed on config page
- Module/Library Name are automatically updated when changing Design/Library File on config page
- The chosen library from config page will be preselected on edit-libraries-page
- The user has the ability to choose libraries or add a new one on edit-libraries-page (dummy functions)
- Libraries are saved to the local library file when clicking on button "save"
- Libraries can be deleted on edit-libraries-page
- Data from library file is read into runtime variables (rest of edit-libraries-page just need to be modelled) 

### Fixed
- Bug in fetching module names in design file (module xy and endmodule were accepted)
- Edits get lost and HTML content is resetted when changing focus of webview page (retainContextWhenHidden)

## [1.0.8] - 2023-03-31

### Added
- Module/Library Name are automatically updated when changing Design/Library File
- New class that reads the data of all libraries and their in/outputs and cells
- New command to edit libraries that shows a dummy page

### Removed
- in `main.js` / `save()` the attribute `codeFolder` is not used and thus its value is set to empty string

### Fixed
- Args and Configs not being read into the internal variables when a PROLEAD project is detected

## [1.0.7] - 2023-03-27

### Added
- Config, Design, Library and Linker file can be selected by file browser
- Module name and library name can only be selected via drop-down-list
- Editing any value before clicking on create new project won't result in a bug, because everything will be validated again

### Removed
- Standard names for module and library

## [1.0.6] - 2023-03-26

### Added
- Walkthrough v1.0 is done and consists of 3 mandatory steps with text description and 2 optional steps with GIFs
- Option "Clone Code" in PreperationProvider adjusted to set path then clone to it
- Different popup messages when getting the source code for first time (using walkthrough)
- Function "Open Project" deleted
- PROLEAD icons on top of the editor can be hidden or shown via extension settings
- Library File must end with ".lib" - validation function adjusted
- Value conditions are added to the description of the settings on config page (when hovering over the info icon)

### Fixed
- showing description of Effect Size instead of Transitional Leakage on config page

## [1.0.5] - 2023-03-18

### Added
- Template settings for new projects can be specified in the extension settings
- Extension setting "Run Time: Welcome Page" will be deactivated after 3 activation times
- Walkthrough is made shorter and more compact and more informative

### Fixed
- Closing the password input box when installing depencies still runs the install command

## [1.0.4] - 2023-03-17

### Added
- Validation functions are provided with significant and precise error messages
- Bug in validation of no\_of\_step\_write\_results is fixed
- Look of html pages config page and create new project adjusted (max-width added)

### Fixed
- Path validation against weird Windows paths was buggy

## [1.0.3] - 2023-03-16

### Added
- User is prompted to enter root password when installing the dependencies
- Double click to use standard setting instead of the button
- Weird Windows pathes are handled

## [1.0.2] - 2023-03-16

### Added
- Pressing enter takes you to the next step, when creating a new project
- Pressing ctrl+s saves the settings in the config page
- An info message is shown when all settings are valid and saved

## [1.0.1] - 2023-03-16

### Added
- Description to the page for creating new project
- Text input for project path into 2 text inputs splitted (one for path and one for name)
- Project directory must not exist because a new directory will be created
- Button Create on the page of create new project to the bottom moved

## [1.0.0] - 2023-02-21

### Added
- Extension published
- Change log completed
- License added
- Readme created
- Walkthrough for beginners finished

## [0.6.0] - 2023-02-16

### Added
- Configuration Page sets the standard values if the read value from the external file is invalid
- Creating a new project is done in serveral steps that follow each other if the previous step was ok
- Creating a new project creates a new folder and adds directly the files of the project to that folder
- Function Create Project is implemented
- Function Evaluate is implemented
- Result Folder is created if no path is specified in args.set
- Settings of config.set can be written from runtime variables to the external file 
- Template for args.set, config.set, design.v, library.lib, linker.ld are added
- The order of writing the settings into config.set is changed and not alphabetic more
- Updates in the Status Bar are shown while runtime

### Fixed
- Starting with the check of local commit and last remote commit before even finishing the fetch process and getting the last remote commit

### Removed
- Side Bar
- Validation of linker file, number of outputs, expected output (they can be empty)

## [0.5.0] - 2023-02-06

### Added
- Frames of the input box of a setting is colored red if the input is invalid
- Parameters of args.set can be written from runtime variables to the external file
- Path of workspace is saved to runtime variables if an open folder (project) is detected
- Paths of args.set and config.set are saved to runtime variables if an open folder (project) is detected that contains those files.
- Path to code folder can be set globally for all projects via extension settings
- Validation of code path and asking the user if the path is invalid for a choice
- Typing invalid values for settings on the configuration page will throw the input and save the default value of the setting

## [0.4.0] - 2023-01-23

### Added
- Configuration Page is completed and contains an info symbol next to each setting
- Command to open projects
- CSS of input box edited to warn in case of error
- CSS of navigation bar in configuration page edited
- Function `Get Ready` is implemented as wished
- Function `Set Directory` is optimized
- Parameters of args.set can be validated and read from external files and saved in runtime variables
- Settings of config.set can be validated and read from external files and saved in runtime variables
## [0.3.0] - 2022-12-30

### Added
- args.set is created for editing the command line parameters of PROLEAD
- Counting the number of times the extension is activated
- Functions to read booleans, directories, files, names, numbers and ranges are implemented
- Icons are added to the top of editor window in a specified order
- Validating paths
- Walkthrough is added

## [0.2.0] - 2022-12-10

### Added
- Internet connection is checked before cloning/merging from Github

## [0.1.0] - 2022-12-01

### Added
- Side Bar with dummy content
- Configuration Page with dummy content

### Removed
- Hello World

## [0.0.0] - 2022-11-15

### Added
- Hello World

