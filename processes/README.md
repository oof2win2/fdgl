# Processes documentation

This file is a documentation of the processes that occur throughout the whole project.

## Handling report updates - clientside handler

Within the handling process of report updates (new reports or revocations), we essentially find
the difference between executed actions before the updates were applied and after they were
applied. We additionally identify the "causing" report as the first created report which
executed the action. This report is passed to command generation. If the causing report
is changed (the red reports in the image below), we need to "reexecute" the action - perform
the undo action and then the execute action.

![](handling_report_updates.png)
![](handling_report_updates_process.png)

## Handling system updates - clientside handler

System updates (such as creation, removal, merging for categories and communities) need to be
handled on the clientside as well to ensure that the correct reports are stored and that
the correct commands are generated. The process is similar to the handling of report updates,
as we need to identify the difference between the state before and after the update. The
difference is that we must modify the reports ourselves, as the server does not send us
any changes. We also need to update the stored Action objects within the database to
link to the correct categories.

![](handling_system_updates.png)