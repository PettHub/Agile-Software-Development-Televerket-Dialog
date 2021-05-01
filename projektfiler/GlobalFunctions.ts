
export class GlobalFunctions {

    public static toId(command: string): string {
        if (command.indexOf("@") == 1) {
            command = command.substring(3, command.length - 1);
        }
        return command;
    }
}