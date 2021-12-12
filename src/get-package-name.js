import loadPkg from 'load-pkg'
import parsePackagejsonName from 'parse-packagejson-name'

export default async () => {
  const packageConfig = await loadPkg()

  return parsePackagejsonName(packageConfig.name).fullName
}
