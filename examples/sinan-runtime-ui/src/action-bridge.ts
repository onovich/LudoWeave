import {
  createActionLog,
  type ActionRef,
  type ActionRefInput,
  type UiActionLogEntry,
  type UiActionLogSource,
} from "@ludoweave/core";

export interface SinanRuntimeUICommand {
  readonly sequence: number;
  readonly channel: "runtime-ui";
  readonly type: "runtime-ui.dispatch-action";
  readonly action: ActionRef;
  readonly source?: UiActionLogSource;
}

export interface SinanActionRefBridge {
  dispatch(action: ActionRefInput, source?: UiActionLogSource): SinanRuntimeUICommand;
  snapshot(): readonly SinanRuntimeUICommand[];
  actionLogSnapshot(): readonly UiActionLogEntry[];
  clear(): void;
}

export function createSinanActionRefBridge(): SinanActionRefBridge {
  const actionLog = createActionLog();
  const commands: SinanRuntimeUICommand[] = [];

  return {
    dispatch(action, source) {
      const entry =
        source === undefined ? actionLog.record({ action }) : actionLog.record({ action, source });
      const command = commandFromActionLogEntry(entry);
      commands.push(command);
      return cloneCommand(command);
    },
    snapshot() {
      return commands.map((command) => cloneCommand(command));
    },
    actionLogSnapshot() {
      return actionLog.snapshot();
    },
    clear() {
      actionLog.clear();
      commands.length = 0;
    },
  };
}

function commandFromActionLogEntry(entry: UiActionLogEntry): SinanRuntimeUICommand {
  const command: MutableSinanRuntimeUICommand = {
    sequence: entry.sequence,
    channel: "runtime-ui",
    type: "runtime-ui.dispatch-action",
    action: entry.action,
  };
  const source = sourceFromActionLogEntry(entry);

  if (source !== undefined) {
    command.source = source;
  }

  return command;
}

function sourceFromActionLogEntry(entry: UiActionLogEntry): UiActionLogSource | undefined {
  const source: MutableUiActionLogSource = {};

  if (entry.actionTargetId !== undefined) {
    source.actionTargetId = entry.actionTargetId;
  }

  if (entry.nodeId !== undefined) {
    source.nodeId = entry.nodeId;
  }

  if (entry.label !== undefined) {
    source.label = entry.label;
  }

  if (
    source.actionTargetId === undefined &&
    source.nodeId === undefined &&
    source.label === undefined
  ) {
    return undefined;
  }

  return source;
}

function cloneCommand(command: SinanRuntimeUICommand): SinanRuntimeUICommand {
  const cloned: MutableSinanRuntimeUICommand = {
    sequence: command.sequence,
    channel: command.channel,
    type: command.type,
    action: command.action,
  };

  if (command.source !== undefined) {
    cloned.source = { ...command.source };
  }

  return cloned;
}

type MutableSinanRuntimeUICommand = {
  sequence: number;
  channel: "runtime-ui";
  type: "runtime-ui.dispatch-action";
  action: ActionRef;
  source?: UiActionLogSource;
};

type MutableUiActionLogSource = {
  actionTargetId?: string;
  nodeId?: string;
  label?: string;
};
