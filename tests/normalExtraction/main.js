module.exports = {
  exec: () => {
    console.log("Hello!");
    console.group("This test: normalExtraction")
    console.log("- Has properly extracted & derived expected config/entrypoint from the package.")
    console.log("- Has properly executed the module.")
    console.groupEnd()
    console.log("Verification code: 0x0001");
  }
}