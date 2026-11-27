import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
    page: {
        paddingTop: 60,
        paddingBottom: 60,
        paddingLeft: 70,
        paddingRight: 60,
        fontFamily: 'Times-Roman',
        fontSize: 12,
        lineHeight: 1.5,
    },
    headerText: {
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
        textDecoration: 'underline'
    },
    row: {
        flexDirection: 'row',
        marginBottom: 5,
    },
    label: {
        width: 150,
    },
    separator: {
        width: 20,
        textAlign: 'center',
    },
    value: {
        flex: 1,
        textAlign: 'justify',
    },
    marginTop20: {
        marginTop: 20,
    },
    marginBottom20: {
        marginBottom: 20,
    },
    paragraph: {
        textAlign: 'justify',
        marginBottom: 10,
        textIndent: 30,
    },
    signatureGrid: {
        display: 'flex',
        flexDirection: 'row',
        marginTop: 40,
        width: '100%',
    },
    signatureBox: {
        flex: 1,
        alignItems: 'center',
    },
    signatureTitle: {
        marginBottom: 40,
    },
    signatureName: {
        textDecoration: 'underline',
        fontWeight: 'bold',
    },
    signatureNip: {
        marginTop: 2,
    },
    image: {
        width: 100,
        height: 60,
        objectFit: 'contain',
        position: 'absolute',
        top: 20,
        zIndex: -1,
    }
});

interface ProposalData {
    studentName: string;
    studentNim: string;
    programStudi: string;
    thesisTitle: string;
    supervisors: Array<{
        name: string;
        nip: string;
        signatureBuffer: Buffer | null;
    }>;
    ketuaJurusan: {
        name: string;
        nip: string;
        signatureBuffer: Buffer | null;
    } | null;
    koordinatorProdi: {
        name: string;
        nip: string;
        signatureBuffer: Buffer | null;
    } | null;
}

export default function SuratPersetujuanProposal({ data }: { data: ProposalData }) {
    const supervisor1 = data.supervisors[0];
    const supervisor2 = data.supervisors[1];

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <Text style={styles.headerText}>HALAMAN PERSETUJUAN PROPOSAL SKRIPSI</Text>

                <View style={styles.row}>
                    <Text style={styles.label}>Nama</Text>
                    <Text style={styles.separator}>:</Text>
                    <Text style={styles.value}>{data.studentName}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>NIM</Text>
                    <Text style={styles.separator}>:</Text>
                    <Text style={styles.value}>{data.studentNim}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Program Studi</Text>
                    <Text style={styles.separator}>:</Text>
                    <Text style={styles.value}>{data.programStudi}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Judul Proposal</Text>
                    <Text style={styles.separator}>:</Text>
                    <Text style={styles.value}>{data.thesisTitle}</Text>
                </View>

                <Text style={[styles.paragraph, styles.marginTop20]}>
                    Telah diperiksa dan disetujui untuk diseminarkan.
                </Text>

                {/* Supervisors Signatures */}
                <View style={styles.signatureGrid}>
                    <View style={styles.signatureBox}>
                        <Text style={styles.signatureTitle}>Pembimbing I,</Text>
                        {supervisor1?.signatureBuffer && (
                            <Image src={{ data: supervisor1.signatureBuffer, format: 'png' }} style={styles.image} />
                        )}
                        <Text style={styles.signatureName}>{supervisor1?.name || '(Belum ditentukan)'}</Text>
                        <Text style={styles.signatureNip}>NIP. {supervisor1?.nip || '-'}</Text>
                    </View>
                    <View style={styles.signatureBox}>
                        <Text style={styles.signatureTitle}>Pembimbing II,</Text>
                        {supervisor2?.signatureBuffer && (
                            <Image src={{ data: supervisor2.signatureBuffer, format: 'png' }} style={styles.image} />
                        )}
                        <Text style={styles.signatureName}>{supervisor2?.name || '(Belum ditentukan)'}</Text>
                        <Text style={styles.signatureNip}>NIP. {supervisor2?.nip || '-'}</Text>
                    </View>
                </View>

                {/* Staff Signatures */}
                <View style={[styles.signatureGrid, { marginTop: 60 }]}>
                    <View style={styles.signatureBox}>
                        <Text style={styles.signatureTitle}>Mengetahui,</Text>
                        <Text style={{ marginBottom: 40 }}>Ketua Jurusan,</Text>
                        {data.ketuaJurusan?.signatureBuffer && (
                            <Image src={{ data: data.ketuaJurusan.signatureBuffer, format: 'png' }} style={[styles.image, { top: 40 }]} />
                        )}
                        <Text style={styles.signatureName}>{data.ketuaJurusan?.name || '(Belum ditentukan)'}</Text>
                        <Text style={styles.signatureNip}>NIP. {data.ketuaJurusan?.nip || '-'}</Text>
                    </View>
                    <View style={styles.signatureBox}>
                        <Text style={styles.signatureTitle}> </Text>
                        <Text style={{ marginBottom: 40 }}>Koordinator Program Studi,</Text>
                        {data.koordinatorProdi?.signatureBuffer && (
                            <Image src={{ data: data.koordinatorProdi.signatureBuffer, format: 'png' }} style={[styles.image, { top: 40 }]} />
                        )}
                        <Text style={styles.signatureName}>{data.koordinatorProdi?.name || '(Belum ditentukan)'}</Text>
                        <Text style={styles.signatureNip}>NIP. {data.koordinatorProdi?.nip || '-'}</Text>
                    </View>
                </View>

            </Page>
        </Document>
    );
}
