import {Timestamp} from "./slack";
import {string, object, array, u64} from "./types";

export type FileCompletions = {[id: string]: number};
namespace FileCompletions {
   export const is: (u: unknown) => u is FileCompletions =
      object.is as any;
}

export type FileInProgress = {
   id: string;
   bytesDownloaded: u64;
   bytesNeeded: u64;
} | null;

namespace FileInProgress {
   export function is(u: unknown): u is FileInProgress {
      if (typeof u !== "object") return false;
      if (u === null) return true;
      return 1
         && object.hasTKey(u, "id", string.is)
         && object.parseTKey(u, "bytesDownloaded", u64.parse)
         && object.parseTKey(u, "bytesNeeded", u64.parse)
   }
}

export type MessageChunk = {
   oldest: Timestamp;
   latest: Timestamp;
   finishedAt: u64;
}

export namespace MessageChunk {
   export const is = (u: unknown): u is MessageChunk => 1
      && object.is(u)
      && object.hasTKey(u, "oldest", Timestamp.is)
      && object.hasTKey(u, "latest", Timestamp.is)
      && object.parseTKey(u, "finishedAt", u64.parse)
}

export type ChunkCollection = MessageChunk[];
export namespace ChunkCollection {
   export const is = array.isTC(MessageChunk.is);

   export type Gap = {
      oldest?: Timestamp;
      latest?: Timestamp;
   };

   export const gapMax = (cc: ChunkCollection) => cc.length;

   export function getGap(cc: ChunkCollection, idx: number): Gap {
      return {
         oldest: cc[idx - 1]?.latest,
         latest: cc[idx]?.oldest,
      };
   }

   export function insert(into: ChunkCollection, m: MessageChunk): boolean {
      const last = into.length - 1;

      // empty
      if (last === -1) {
         into.push(m);
         return true;
      }

      // first
      if (m.latest <= into[0].oldest)
         var insertAt = 0;
      else
      // last
      if (m.oldest >= into[last].latest)
         var insertAt = last;
      else
      // somewhere in the middle
      {
         let lower = 1;
         let upper = last;

         while (lower !== upper) {
            const halfLength = upper - lower >> 1;
            const pivot = lower + halfLength;
            if (m.latest <= into[pivot].oldest) {
               upper = pivot;
               continue;
            }
            if (m.oldest >= into[pivot].latest) {
               lower = pivot + 1;
               continue;
            }
            return false;
         }

         var insertAt = lower;
      }

      // normally, we couldn't guarantee that lower is a valid index into the
      // array. however, the special optimizations above checking for empty,
      // first, and last mean that if we have reached this line of execution,
      // we know that into[lower] is a valid array element which is not the
      // first nor last element in the array. Thereforem, we also know that
      // into[lower - 1] and into[lower + 1] point to valid elements within the
      // array. In the following code, we are only going to use the former.

      // with that the knowledge that
      //    m.latest <= into[lower]
      // or m.oldest >= into[lower - 1],
      // we must check that it can comfortably fit between
      // into[lower - 1] and into[lower].

      if (into[insertAt - 1].latest <= m.oldest)
      if (into[insertAt + 0].oldest >= m.latest)
      {
         into.splice(insertAt, 0, m);
         return true;
      }

      return false;
   }
}

export class sProgress {
   fileCompletions: {[id: string]: number};
   fileInProgress: FileInProgress;
   messageChunks: MessageChunk[];

   static default: sProgress = {
      fileCompletions: {},
      fileInProgress: null,
      messageChunks: [],
   };

   static parse(u: unknown): sProgress {
      if (!object.is(u))
         throw new TypeError(`progress_json must be an object!`);
      if (!object.hasTKey(u, "fileCompletions", FileCompletions.is))
         throw new TypeError("progress_json.fileCompletions must be a FileCompletions!");
      if (!object.hasTKey(u, "fileInProgress", FileInProgress.is))
         throw new TypeError("progress_json.fileInProgress must be a FileInProgress!");
      if (!object.hasTKey(u, "messageChunks", ChunkCollection.is))
         throw new TypeError("progress_json.messageChunks must exist!");

      return u;
   }
}
