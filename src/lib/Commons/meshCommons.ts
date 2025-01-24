import {  Data, MeshTxBuilder, serializePlutusScript } from "@meshsdk/core";
import * as meshStuff from "@meshsdk/core";

import { applyParamsToScript } from "@meshsdk/core-csl";
import { blockChainProvider } from "./Constants/onchain";
import  *  as lucidStuff from "lucid-cardano";

export function getScript(
    blueprintCompiledCode: string,
    params: Data[] = [],
    version: "V1" | "V2" | "V3" = "V3"
  ) {
    const scriptCbor = applyParamsToScript(blueprintCompiledCode, params);
  
    const scriptAddr = serializePlutusScript(
      { code: scriptCbor, version: version },
      undefined,
      0
    ).address;
  
    return { scriptCbor, scriptAddr };
  }
  export function convertLucidAssetsToMesh(assetsRecord: lucidStuff.Assets): meshStuff.Asset[] {
    const assetsArray: meshStuff.Asset[] = [];
  
    for (const unit in assetsRecord) {
      if (assetsRecord.hasOwnProperty(unit)) { // Importante para evitar iterar sobre propiedades del prototipo
        const quantity = assetsRecord[unit];
        assetsArray.push({
          unit: unit,
          quantity: quantity.toString(), // Convertir bigint a string
        });
      }
    }
  
    return assetsArray;
  }
  export function getTxBuilder() {
    return new MeshTxBuilder({
      fetcher: blockChainProvider,
      submitter: blockChainProvider,
    });
  }