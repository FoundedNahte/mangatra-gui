#[derive(Debug, thiserror::Error)]
pub enum MangatraError {
    #[error(transparent)]
    Serialization(#[from] serde_json::Error),
}

impl serde::Serialize for MangatraError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        serializer.serialize_str(self.to_string().as_ref())
    }
}
