export function Lighting() {
  return (
    <>
      <ambientLight color={0x8fa4d6} intensity={0.22} />
      <directionalLight color={0x6f8cff} intensity={0.35} position={[-4, 4, -3]} />
    </>
  );
}
