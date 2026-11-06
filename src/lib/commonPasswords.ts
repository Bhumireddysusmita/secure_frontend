// Mirrors backend/app/common_passwords.py. Compared case-insensitively.
export const COMMON_PASSWORDS = new Set(
  `
password1 password12 password123 password1234 passw0rd p@ssw0rd p@ssword1 pa55word pa55w0rd
qwerty123 qwerty12 qwerty1234 qwertyuiop1 1qaz2wsx zaq12wsx 1q2w3e4r 1q2w3e4r5t q1w2e3r4 q1w2e3r4t5
abc12345 abcd1234 abc123456 a1234567 a12345678 a123456789 123456789a 12345678a 1234567a 123456a7
iloveyou1 iloveyou2 welcome1 welcome123 letmein1 letmein123 admin123 admin1234 administrator1
monkey123 dragon123 football1 baseball1 sunshine1 princess1 superman1 batman123 starwars1 trustno1
master123 shadow123 michael1 charlie1 jordan23 hello123 hello1234 freedom1 whatever1 computer1
summer2024 summer2025 winter2024 winter2025 spring2025 autumn2025 changeme1 changeme123 secret123
test1234 testing123 test12345 user1234 login123 default1 guest123 temp1234 access123 mypassword1
`
    .split(/\s+/)
    .filter(Boolean),
);

export const isCommonPassword = (password: string) => COMMON_PASSWORDS.has(password.toLowerCase());
