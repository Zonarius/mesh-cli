import { MeshAPI, ProjectNodesNodeUuidGetResponse } from 'mesh-api-client';
import { State } from '../mesh-cli';

export default async function deleteNode(mesh: MeshAPI, line: string, cmd: string[], state: State): Promise<State> {
    return new Promise<State>(async (resolve, reject) => {
        if (cmd[1] === 'node') {
            mesh.api.project(state.project).nodes.nodeUuid(cmd[2]).delete()
                .then(() => {
                    resolve(state);
                })
                .catch((e) => {
                    reject(e);
                })
        } else {
            reject('Unknown operation ' + cmd[1]);
        }
    });
}