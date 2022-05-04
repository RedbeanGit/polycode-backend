import * as Docker from 'dockerode';
import { Inject, Injectable } from '@nestjs/common';
import { DOCKER } from '../constants';

class RunnerBuffer {
  private buffer: string;

  write(data: string) {
    this.buffer = data.toString();
  }

  getBuffer(): string {
    return this.buffer;
  }
}

export interface EditorContent {
  name: string;
  content: string;
}

@Injectable()
export class RunnersService {
  constructor(@Inject(DOCKER) private readonly docker: typeof Docker) {}

  async run(image: string, command: string, editorsContent: EditorContent[]) {
    const editorsCommand = editorsContent
      .map(
        (editorContent) =>
          `echo "${editorContent.content.replaceAll('"', '\\"')}" > ${
            editorContent.name
          }`,
      )
      .join(' ; ');
    const fullCommand = editorsCommand + ' ; ' + command;
    const bufferOut = new RunnerBuffer();
    const bufferErr = new RunnerBuffer();

    return await this.docker
      .run(image, ['sh', '-c', fullCommand], [bufferOut, bufferErr], {
        Tty: false,
      })
      .then(([, container]) => {
        container.remove({ force: true });
        return { stdout: bufferOut.getBuffer(), stderr: bufferErr.getBuffer() };
      });
  }
}
