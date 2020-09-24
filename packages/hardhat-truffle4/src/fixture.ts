import fsExtra from "fs-extra";
import { NomicLabsHardhatPluginError } from "hardhat/internal/core/errors";
import { ProjectPaths } from "hardhat/types/config";
import { HardhatRuntimeEnvironment } from "hardhat/types/runtime";
import path from "path";

export const TRUFFLE_FIXTURE_NAME = "truffle-fixture";

export async function hasTruffleFixture(paths: ProjectPaths) {
  try {
    require.resolve(path.join(paths.tests, TRUFFLE_FIXTURE_NAME));
    return true;
  } catch (error) {
    return false;
  }
}

export async function hasMigrations(paths: ProjectPaths) {
  const migrationsDir = path.join(paths.root, "migrations");

  if (!(await fsExtra.pathExists(migrationsDir))) {
    return false;
  }

  const files = await fsExtra.readdir(migrationsDir);
  const jsFiles = files.filter((f) => f.toLowerCase().endsWith(".js"));

  return jsFiles.length > 1;
}

export async function getTruffleFixtureFunction(
  paths: ProjectPaths
): Promise<(env: HardhatRuntimeEnvironment) => Promise<void>> {
  const fixturePath = require.resolve(
    path.join(paths.tests, TRUFFLE_FIXTURE_NAME)
  );

  let fixture = require(fixturePath);
  if (fixture.default !== undefined) {
    fixture = fixture.default;
  }

  if (!(fixture instanceof Function)) {
    throw new NomicLabsHardhatPluginError(
      "@nomiclabs/hardhat-truffle4",
      `Truffle fixture file ${fixturePath} must return a function`
    );
  }

  return fixture;
}
