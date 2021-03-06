import { NomicLabsBuidlerPluginError } from "@nomiclabs/buidler/plugins";

import { pluginName } from "./pluginContext";

export async function encodeArguments(
  abi: any,
  contractFilename: string,
  contractName: string,
  constructorArguments: any[]
) {
  const { Interface } = await import("@ethersproject/abi");

  const contractInterface = new Interface(abi);
  let deployArgumentsEncoded;
  try {
    deployArgumentsEncoded = contractInterface
      .encodeDeploy(constructorArguments)
      .replace("0x", "");
  } catch (error) {
    const {
      isABIArgumentLengthError,
      isABIArgumentTypeError,
      isABIArgumentOverflowError,
    } = await import("./ABITypes");
    if (isABIArgumentLengthError(error)) {
      // TODO: add a list of types and constructor arguments to the error message?
      const message = `The constructor for ${contractFilename}:${contractName} has ${error.count.types} parameters
but ${error.count.values} arguments were provided instead.`;
      throw new NomicLabsBuidlerPluginError(pluginName, message, error);
    }
    if (isABIArgumentTypeError(error)) {
      const message = `Value ${error.value} cannot be encoded for the parameter ${error.argument}.
Encoder error reason: ${error.reason}`;
      throw new NomicLabsBuidlerPluginError(pluginName, message, error);
    }
    if (isABIArgumentOverflowError(error)) {
      const message = `Value ${error.value} is not a safe integer and cannot be encoded.
Use a string instead of a plain number.
Encoder error reason: ${error.fault} fault in ${error.operation}`;
      throw new NomicLabsBuidlerPluginError(pluginName, message, error);
    }
    // Should be unreachable.
    throw error;
  }

  return deployArgumentsEncoded;
}
