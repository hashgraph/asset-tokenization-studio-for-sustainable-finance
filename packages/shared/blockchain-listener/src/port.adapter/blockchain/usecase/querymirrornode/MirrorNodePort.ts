// SPDX-License-Identifier: Apache-2.0

export default interface MirrorNodePort {
  fetchData<T>(path: string, maxRetries: number): Promise<T>
}
